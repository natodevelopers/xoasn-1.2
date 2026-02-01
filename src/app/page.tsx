"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ProjectsView } from "@/features/projects/components/projects-view";
import { LandingPage } from "@/features/auth/components/landing-page";
import { AuthLoadingView } from "@/features/auth/components/auth-loading-view";

const Home = () => {
  return (
    <>
      <Authenticated>
        <ProjectsView />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <AuthLoading>
        <AuthLoadingView />
      </AuthLoading>
    </>
  );
};

export default Home;
