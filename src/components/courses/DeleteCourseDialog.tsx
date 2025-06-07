
import { useState, useEffect } from "react";
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
  const [countdown, setCountdown] = useState(3);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    if (open && canDelete) {
      setCountdown(3);
      setCanConfirm(false);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanConfirm(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (open && !canDelete) {
      setCanConfirm(false);
    }
  }, [open, canDelete]);

  const handleConfirm = () => {
    if (canConfirm && canDelete) {
      onConfirm();
    }
  };

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
            {canDelete && " This action cannot be undone."}
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

        {canDelete && (
          <div className="bg-gray-50 p-3 rounded-lg my-4">
            <p className="font-medium text-gray-900 mb-1">Course to be deleted:</p>
            <p className="text-sm text-gray-600">• {courseName}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`${
                canConfirm 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canConfirm ? 'Delete Course' : `Please wait... ${countdown}s`}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
