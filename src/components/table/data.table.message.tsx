"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface errorProps {
  errorStatus: number;
  errorMessage: string;
}

export function AlertResponse({
  errorStatus,
  errorMessage,
}: Readonly<errorProps>) {
  return (
    <div>
      {errorStatus === 200 ? (
        <Alert className="bg-green-100 border border-green-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold text-green-800">
            Status Code : {errorStatus}
          </AlertTitle>
          <AlertDescription className="text-green-800">
            Message : Data Empty
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-red-100 border border-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold text-red-800">
            Status Code : {errorStatus}
          </AlertTitle>
          <AlertDescription className="text-red-800">
            Message : {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
