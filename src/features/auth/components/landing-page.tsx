"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Code2, Sparkles, Zap, Globe } from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Code2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Xoasn</h1>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              AI-Powered Cloud IDE
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Build, code, and deploy directly in your browser with intelligent AI assistance. 
              No setup required.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </SignInButton>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-16 w-full">
            <div className="flex flex-col items-center space-y-3 p-6 bg-card rounded-lg border">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">AI-Powered</h3>
              <p className="text-sm text-muted-foreground text-center">
                Intelligent code suggestions and AI assistance powered by advanced models
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 p-6 bg-card rounded-lg border">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground text-center">
                Instant setup with WebContainer technology. Start coding in seconds
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 p-6 bg-card rounded-lg border">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Cloud Native</h3>
              <p className="text-sm text-muted-foreground text-center">
                Access your projects from anywhere. Full development environment in the cloud
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 Xoasn. Built with Next.js, Convex, and AI.
          </p>
        </div>
      </div>
    </div>
  );
};
