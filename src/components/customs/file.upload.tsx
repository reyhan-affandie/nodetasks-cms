import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, FileIcon } from "lucide-react";
import { API_URL } from "@/constants/env";

interface FileUploadProps {
  id: string;
  name: string;
  value?: string;
  onChange?: (file: File | null) => void;
}

export function FileUpload({ id, name, value, onChange }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setPreview(URL.createObjectURL(file)); // create preview link
      setFileName(file.name);
      onChange?.(file);
    } else {
      setPreview(null);
      setFileName(null);
      onChange?.(null);
    }
  };

  const displayName = fileName || (value ? value.split("/").pop() : null);
  const fileHref = preview || (value ? `${API_URL}/${value}` : null);

  return (
    <div className="space-y-2 space-x-0">
      {fileHref && displayName ? (
        <a
          href={fileHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex flex-col"
        >
          <FileDown className="w-[80px] h-[80px]" />
          <span className="text-sm truncate max-w-[200px]">{displayName}</span>
        </a>
      ) : (
        <FileIcon className="w-[80px] h-[80px] stroke-gray-500" />
      )}

      <div className="flex gap-2">
        <Input id={id} name={name} type="file" className="hidden" onChange={handleFileChange} />
        <Button asChild className="cursor-pointer">
          <Label htmlFor={id}>Browse</Label>
        </Button>
      </div>
    </div>
  );
}
