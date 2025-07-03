import { toast } from "@/hooks/use-toast";
import { X, Check } from "lucide-react";

interface ToastMessageOptions {
  api: string;
  variant?: "default" | "destructive";
  description?: string;
  status?: number;
  statusText?: string;
}

export function toastMessage({
  variant = "default",
  description,
  api,
  status,
  statusText,
}: ToastMessageOptions) {
  const Icon = variant === "destructive" ? X : Check;

  toast({
    variant,
    description: (
      <div className="flex flex-1">
        <Icon
          className={`mr-2 font-bold ${
            variant === "destructive" ? "text-red-500" : "text-green-500"
          }`}
        />
        <div className="flex flex-1 text-sm font-bold">
          <span className="first-letter:uppercase">{api}</span>
          {status && statusText && (
            <span>
              &nbsp;{variant === "destructive" ? "Error" : "Success"} {status} |{" "}
              {statusText}
            </span>
          )}
          {description && !status && !statusText && (
            <span>&nbsp;{description}</span>
          )}
        </div>
      </div>
    ),
  });
}
