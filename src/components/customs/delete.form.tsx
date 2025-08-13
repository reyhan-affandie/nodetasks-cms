import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { deleteAction } from "@/actions/actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface DeleteProps {
  id: number;
  api: string;
  description: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteDialog({ id, api, description, open, onClose, onSuccess }: DeleteProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteAction(api, id);
    setLoading(false);
    if (result?.error) {
      setError(result.statusText || "Failed to delete");
      toast.error(api, {
        description: result.status + " | " + result.statusText,
      });
    } else {
      toast.success(api, {
        description: result.status + " | " + "Data successfully deleted",
      });
      onClose();
      onSuccess?.();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("delete_confirmation")} {api}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="font-bold text-sm py-2">{description}</div>
        {error && <p className="text-sm text-red-500 italic">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {t("yes")}
          </AlertDialogAction>
          <AlertDialogCancel onClick={onClose}>{t("no")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
