"use client";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MouseEventHandler } from "react";

function Loader({ text }: { readonly text: string }) {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <p>{text}</p>
    </div>
  );
}

interface SubmitButtonProps {
  text: string;
  loadingText: string;
  className?: string;
  loading?: boolean;
  customOnClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}

export function SubmitButton({ text, loadingText, loading, className, customOnClick }: Readonly<SubmitButtonProps>) {
  const status = useFormStatus();
  return (
    <Button type="submit" aria-disabled={status.pending || loading} disabled={status.pending || loading} className={cn(className)} onClick={customOnClick}>
      {status.pending || loading ? <Loader text={loadingText} /> : text}
    </Button>
  );
}
export function SpecialSubmitButton({
  text,
  loadingText,
  loading,
  className,
  onClick,
  disabled = false, // default to false
}: {
  text: string;
  loadingText: string;
  loading?: boolean;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const status = useFormStatus();
  const isDisabled = status.pending || loading || disabled;

  return (
    <Button type="button" aria-disabled={isDisabled} disabled={isDisabled} className={className} onClick={onClick}>
      {isDisabled ? <Loader text={loadingText} /> : text}
    </Button>
  );
}
