"use client";

import { Trash2, TriangleAlert } from "lucide-react";

import { denyUser } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type RemoveUserDialogProps = {
  userId: number;
  userName: string;
  userEmail: string;
};

export function RemoveUserDialog({ userId, userName, userEmail }: RemoveUserDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="text-[var(--destructive)] hover:bg-red-600 hover:text-[var(--destructive-foreground)]"
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-start">
          <AlertDialogMedia className="bg-red-50 text-[var(--destructive)]">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {userName || userEmail} from the app. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-1">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={denyUser}>
            <input type="hidden" name="userId" value={userId} />
            <Button
              type="submit"
              variant="destructive"
              className="w-full sm:w-auto"
            >
              Remove user
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
