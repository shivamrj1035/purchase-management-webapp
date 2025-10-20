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
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
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
  const { user, logout } = useAuthStore();
  const [step, setStep] = useState<"confirm" | "reauthenticate">("confirm");
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    if (!isDeleting) {
      setStep("confirm");
      setConfirmText("");
      setPassword("");
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    setStep("reauthenticate");
  };

  const deleteAllUserData = async (userId: string) => {
    try {
      // Collections to delete from
      const collections = [
        "portfolios",
        "fundingSources",
        "emiPayments",
        "outgoingPayments",
        "propertyDetails",
        "notifications",
      ];

      // Delete all documents in each collection for this user
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map((document) =>
          deleteDoc(doc(db, collectionName, document.id))
        );

        await Promise.all(deletePromises);
      }

      // Delete user document
      await deleteDoc(doc(db, "users", userId));

      return true;
    } catch (error) {
      console.error("Error deleting user data:", error);
      return false;
    }
  };

  const handleDelete = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    if (!auth.currentUser || !user?.email) {
      toast.error("User not authenticated");
      return;
    }

    setIsDeleting(true);

    try {
      // Step 1: Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Step 2: Delete all Firestore data
      const dataDeleted = await deleteAllUserData(auth.currentUser.uid);

      if (!dataDeleted) {
        throw new Error("Failed to delete user data");
      }

      // Step 3: Delete Firebase Authentication account
      await deleteUser(auth.currentUser);

      // Step 4: Logout and redirect
      logout();
      toast.success("Account deleted successfully");
      router.push("/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);

      if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Please log out and log in again before deleting account.");
      } else {
        toast.error(
          error.message || "Failed to delete account. Please try again."
        );
      }
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

        {step === "confirm" ? (
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
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                For security, please re-enter your password to confirm account
                deletion.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Enter your password"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isDeleting) {
                    handleDelete();
                  }
                }}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          {step === "confirm" ? (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={confirmText !== "DELETE" || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!password || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
