
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  studentNames?: string[];
}

export const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  count, 
  studentNames = [] 
}: DeleteConfirmationModalProps) => {
  const [countdown, setCountdown] = useState(5);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setCanDelete(false);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanDelete(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Confirm Deletion
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete {count === 1 ? 'this student account' : `${count} student accounts`}? 
            This action cannot be undone.
          </p>

          {studentNames.length > 0 && studentNames.length <= 5 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">Students to be deleted:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {studentNames.map((name, index) => (
                  <li key={index}>• {name}</li>
                ))}
              </ul>
            </div>
          )}

          {studentNames.length > 5 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">Students to be deleted:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {studentNames.slice(0, 3).map((name, index) => (
                  <li key={index}>• {name}</li>
                ))}
                <li className="text-gray-500">... and {studentNames.length - 3} more</li>
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={!canDelete}
              className={`flex-1 ${
                canDelete 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canDelete ? 'Confirm Delete' : `Please wait... ${countdown}s`}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
