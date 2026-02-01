import { useCallback, useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

import { 
  buildFileTree,
  getFilePath
} from "@/features/preview/utils/file-tree";
import { useFiles } from "@/features/projects/hooks/use-files";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

// Singleton WebContainer instance
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let isBooting = false;

const getWebContainer = async (): Promise<WebContainer> => {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (bootPromise) {
    return bootPromise;
  }

  if (isBooting) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getWebContainer();
  }

  isBooting = true;
  
  bootPromise = WebContainer.boot({ 
    coep: "credentialless",
    workdirName: "project"
  }).then((instance) => {
    webcontainerInstance = instance;
    isBooting = false;
    console.log("WebContainer booted successfully");
    return instance;
  }).catch((err) => {
    console.error("WebContainer boot failed:", err);
    bootPromise = null;
    isBooting = false;
    throw err;
  });

  return bootPromise;
};

interface UseWebContainerProps {
  projectId: Id<"projects">;
  enabled: boolean;
  settings?: {
    installCommand?: string;
    devCommand?: string;
  };
};

export const useWebContainer = ({
  projectId,
  enabled,
  settings,
}: UseWebContainerProps) => {
  const [status, setStatus] = useState<
    "idle" | "booting" | "installing" | "running" | "error"
  >("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState("");

  const containerRef = useRef<WebContainer | null>(null);
  const hasStartedRef = useRef(false);

  // Fetch files from Convex (auto-updates on changes)
  const files = useFiles(projectId);

  // Initial boot and mount
  useEffect(() => {
    if (!enabled || !files || files.length === 0 || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    let isMounted = true;

    const start = async () => {
      try {
        setStatus("booting");
        setError(null);
        setTerminalOutput("");

        const appendOutput = (data: string) => {
          if (isMounted) {
            setTerminalOutput((prev) => prev + data);
          }
        };

        if (!isMounted) return;

        appendOutput("Initializing WebContainer...\n");
        const container = await getWebContainer();
        
        if (!isMounted) return;
        
        containerRef.current = container;
        appendOutput("WebContainer ready\n");

        appendOutput("Mounting file system...\n");
        const fileTree = buildFileTree(files);
        
        // Check if package.json exists
        const hasPackageJson = files.some(f => f.name === "package.json" && f.type === "file");
        if (!hasPackageJson) {
          throw new Error("No package.json found. Please create a package.json file first.");
        }
        
        await container.mount(fileTree, { mountPoint: "/" });
        
        if (!isMounted) return;
        
        appendOutput("File system mounted\n");

        const serverReadyHandler = (_port: number, url: string) => {
          if (isMounted) {
            appendOutput(`\nServer ready at ${url}\n`);
            setPreviewUrl(url);
            setStatus("running");
          }
        };
        
        container.on("server-ready", serverReadyHandler);

        if (!isMounted) return;

        setStatus("installing");
        
        // Wait a bit for container to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Parse install command (default: npm install)
        const installCmd = settings?.installCommand || "npm install";
        const [installBin, ...installArgs] = installCmd.split(" ");
        appendOutput(`$ ${installCmd}\n`)
        const installProcess = await container.spawn(installBin, installArgs);
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              appendOutput(data);
            },
          })
        );
        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          throw new Error(
            `${installCmd} failed with code ${installExitCode}`
          );
        }

        if (!isMounted) return;

        // Parse dev command (default: npm run dev)
        const devCmd = settings?.devCommand || "npm run dev";
        const [devBin, ...devArgs] = devCmd.split(" ");
        appendOutput(`\n$ ${devCmd}\n`);
        const devProcess = await container.spawn(devBin, devArgs);
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              appendOutput(data);
            },
          })
        );
      } catch (error) {
        console.error("WebContainer error:", error);
        let errorMessage = "Failed to start preview. Please try restarting.";
        
        if (error instanceof Error) {
          if (error.message.includes("tcp") || error.message.includes("TCP")) {
            errorMessage = "WebContainer TCP error. Please refresh the page and try again.";
          } else {
            errorMessage = error.message;
          }
        }
        
        if (isMounted) {
          setError(errorMessage);
          setStatus("error");
        }
        
        // Clean up on error
        if (containerRef.current) {
          containerRef.current = null;
        }
      }
    };

    start();

    return () => {
      isMounted = false;
    };
  }, [
    enabled,
    files,
    restartKey,
    settings?.devCommand,
    settings?.installCommand,
  ]);

  // Sync file changes (hot-reload)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !files || status !== "running") return;

    const filesMap = new Map(files.map((f) => [f._id, f]));

    for (const file of files) {
      if (file.type !== "file" || file.storageId || !file.content) continue;

      const filePath = getFilePath(file, filesMap);
      container.fs.writeFile(filePath, file.content);
    }
  }, [files, status]);

  // Reset when disabled
  useEffect(() => {
    if (!enabled) {
      hasStartedRef.current = false;
      setStatus("idle");
      setPreviewUrl(null);
      setError(null);
      containerRef.current = null;
    }
  }, [enabled]);

  // Restart the entire WebContainer process
  const restart = useCallback(() => {
    containerRef.current = null;
    hasStartedRef.current = false;
    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
    setRestartKey((k) => k + 1);
  }, []);

  return {
    status,
    previewUrl,
    error,
    restart,
    terminalOutput,
  };
};
