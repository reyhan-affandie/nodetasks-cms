"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function LogoutModal({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent className="flex flex-col items-center justify-center bg-background shadow-lg border border-border">
        <DialogTitle>Logging out...</DialogTitle>
        <Loader2 className="size-10 animate-spin text-primary" />
      </DialogContent>
    </Dialog>
  );
}
