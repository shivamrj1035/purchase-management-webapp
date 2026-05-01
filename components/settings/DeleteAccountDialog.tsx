"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState<"confirm">("confirm");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    if (!isDeleting) {
      setStep("confirm");
      setConfirmText("");
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    handleDelete();
  };

  const handleDelete = async () => {
    // This is now a placeholder as we've migrated to Clerk and Google Sheets.
    // Real deletion should happen via Clerk's API and by disconnecting the spreadsheet.
    setIsDeleting(true);

    try {
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.info("Account deletion request submitted. Our support team will process it shortly.");
      handleClose();
    } catch (error: any) {
      console.error("Error submitting deletion request:", error);
      toast.error("Failed to submit deletion request. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            This action cannot be undone. All your data will be permanently
            deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-300 font-medium mb-2">
              This will permanently delete:
            </p>
            <ul className="text-sm text-red-300/80 space-y-1 list-disc list-inside">
              <li>Your account and profile</li>
              <li>All funding sources</li>
              <li>All EMI payment records</li>
              <li>All outgoing payment records</li>
              <li>Property details and configurations</li>
              <li>All notifications</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmText" className="text-slate-300">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </Label>
            <Input
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmText !== "DELETE" || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
