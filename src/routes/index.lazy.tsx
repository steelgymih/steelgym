import { createLazyFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/sections/landing";
import { BootScreen } from "@/components/boot-screen";

export const Route = createLazyFileRoute("/")({
  component: LandingPage,
  pendingComponent: BootScreen,
});
