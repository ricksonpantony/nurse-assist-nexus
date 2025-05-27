
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/hooks/useStudents";

interface PaymentUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onPaymentAdded: () => void;
}

export const PaymentUpdateModal = ({ isOpen, onClose, student, onPaymentAdded }: PaymentUpdateModalProps) => {
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("unselected");
  const [paymentMode, setPaymentMode] = useState("unselected");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [updateCourseStatus, setUpdateCourseStatus] = useState(false);
  const [newCourseStatus, setNewCourseStatus] = useState("unselected");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || stage === "unselected" || paymentMode === "unselected" || !paymentDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (updateCourseStatus && newCourseStatus === "unselected") {
      toast({
        title: "Error",
        description: "Please select a course status",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Record the payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          student_id: student.id,
          amount: parseFloat(amount),
          stage,
          payment_mode: paymentMode,
          payment_date: format(paymentDate, 'yyyy-MM-dd')
        }]);

      if (paymentError) throw paymentError;

      // Update course status if requested
      if (updateCourseStatus && newCourseStatus !== "unselected") {
        const { error: statusError } = await supabase
          .from('students')
          .update({ status: newCourseStatus })
          .eq('id', student.id);

        if (statusError) throw statusError;
      }

      toast({
        title: "Success",
        description: updateCourseStatus 
          ? "Payment recorded and course status updated successfully"
          : "Payment recorded successfully",
      });

      // Reset form
      setAmount("");
      setStage("unselected");
      setPaymentMode("unselected");
      setPaymentDate(new Date());
      setUpdateCourseStatus(false);
      setNewCourseStatus("unselected");
      onClose();
      onPaymentAdded();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setStage("unselected");
    setPaymentMode("unselected");
    setPaymentDate(new Date());
    setUpdateCourseStatus(false);
    setNewCourseStatus("unselected");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-blue-800">
              Record Payment - {student.full_name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Student ID: {student.id}</p>
          <p className="text-sm text-blue-600">Current Status: {student.status}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="stage">Payment Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">Select stage</SelectItem>
                  <SelectItem value="Advance">Advance Payment</SelectItem>
                  <SelectItem value="Second">Second Payment</SelectItem>
                  <SelectItem value="Third">Third Payment</SelectItem>
                  <SelectItem value="Final">Final Payment</SelectItem>
                  <SelectItem value="Other">Other Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">Select payment mode</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Online Payment">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-1 justify-start text-left font-normal"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={(date) => date && setPaymentDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Course Status Update Section */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="updateStatus" 
                checked={updateCourseStatus}
                onCheckedChange={(checked) => {
                  setUpdateCourseStatus(checked as boolean);
                  if (!checked) setNewCourseStatus("unselected");
                }}
              />
              <Label htmlFor="updateStatus" className="text-sm font-medium">
                Update course status with this payment?
              </Label>
            </div>
            
            {updateCourseStatus && (
              <div>
                <Label htmlFor="courseStatus">New Course Status</Label>
                <Select value={newCourseStatus} onValueChange={setNewCourseStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unselected">Select new status</SelectItem>
                    <SelectItem value="awaiting-course">Awaiting Course</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="face-to-face">Face to Face</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
