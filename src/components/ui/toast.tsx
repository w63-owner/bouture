"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        className:
          "!rounded-btn !font-body !text-sm !shadow-card !border-none",
        classNames: {
          success: "!bg-primary !text-white",
          error: "!bg-error !text-white",
          info: "!bg-neutral-900 !text-white",
        },
      }}
    />
  );
}

export { Toaster, toast };
