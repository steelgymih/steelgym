import { createFileRoute } from "@tanstack/react-router";
import { BootScreen } from "@/components/boot-screen";

export const Route = createFileRoute("/admin")({
  pendingComponent: BootScreen,
});
