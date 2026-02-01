"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function GenerateButton({
  onClick,
  disabled,
  loading,
}: GenerateButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} size="lg">
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Generowanie...
        </>
      ) : (
        "Generuj fiszki"
      )}
    </Button>
  );
}
