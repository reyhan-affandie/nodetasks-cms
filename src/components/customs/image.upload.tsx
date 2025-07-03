import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { API_URL } from "@/constants/env";

interface ImageUploadProps {
  id: string;
  name: string;
  value?: string;
  onChange?: (file: File | null) => void;
}

export function ImageUpload({ id, name, value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setPreview(URL.createObjectURL(file));
      onChange?.(file);
    } else {
      onChange?.(null);
    }
  };

  const imageSrc = preview || (value ? `${API_URL}/${value}` : null);

  return (
    <div className="space-y-2 space-x-0">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt="Uploaded Image"
          layout="intrinsic"
          width={100}
          height={100}
          className="border border-gray-300 h-auto object-contain rounded"
        />
      ) : (
        <ImageIcon size={100} className="stroke-gray-600 ml-[-10px]" />
      )}
      <div className="flex items-center gap-2">
        <Input id={id} name={name} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        <Button asChild className="cursor-pointer">
          <Label htmlFor={id}>Browse</Label>
        </Button>
      </div>
    </div>
  );
}
