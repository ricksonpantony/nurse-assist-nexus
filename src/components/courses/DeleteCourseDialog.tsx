
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users } from "lucide-react";

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  canDelete: boolean;
  studentCount: number;
  onConfirm: () => void;
}

export const DeleteCourseDialog = ({
  open,
  onOpenChange,
  courseName,
  canDelete,
  studentCount,
  onConfirm,
}: DeleteCourseDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Course
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the course "{courseName}"?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!canDelete && (
          <Alert variant="destructive" className="my-4">
            <Users className="h-4 w-4" />
            <AlertDescription>
              This course is currently assigned to {studentCount} student{studentCount !== 1 ? 's' : ''}. 
              Please update the student details before deleting.
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Course
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
