
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Payment {
  id: string;
  payment_date: string;
  stage: string;
  amount: number;
  payment_mode: string;
  change_log?: string;
}

interface EditPaymentModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPaymentModal = ({ payment, isOpen, onClose, onSuccess }: EditPaymentModalProps) => {
  const [paymentDate, setPaymentDate] = useState(payment.payment_date);
  const [stage, setStage] = useState(payment.stage);
  const [amount, setAmount] = useState(payment.amount.toString());
  const [paymentMode, setPaymentMode] = useState(payment.payment_mode);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user profile for display name
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        setCurrentUser({
          email: user.email,
          name: profile?.full_name || user.email
        });
      }
    };
    getCurrentUser();
  }, []);

  const stages = [
    'Advance',
    'First Installment',
    'Second Installment',
    'Final Payment',
    'Full Payment'
  ];

  const paymentModes = [
    'Bank Transfer',
    'Credit Card',
    'Debit Card',
    'Cash',
    'Cheque',
    'Online Payment'
  ];

  const handleSave = async () => {
    if (!paymentDate || !stage || !amount || !paymentMode) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create detailed change entries
      const changes = [];
      const timestamp = new Date().toISOString();
      const userInfo = currentUser ? `${currentUser.name} (${currentUser.email})` : 'System';

      if (parseFloat(amount) !== payment.amount) {
        changes.push(`[${format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss')}] ${userInfo}: Amount changed from $${payment.amount.toLocaleString()} to $${parseFloat(amount).toLocaleString()}`);
      }
      if (paymentDate !== payment.payment_date) {
        changes.push(`[${format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss')}] ${userInfo}: Date changed from ${format(new Date(payment.payment_date), 'dd/MM/yyyy')} to ${format(new Date(paymentDate), 'dd/MM/yyyy')}`);
      }
      if (stage !== payment.stage) {
        changes.push(`[${format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss')}] ${userInfo}: Stage changed from "${payment.stage}" to "${stage}"`);
      }
      if (paymentMode !== payment.payment_mode) {
        changes.push(`[${format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss')}] ${userInfo}: Payment mode changed from "${payment.payment_mode}" to "${paymentMode}"`);
      }

      // Combine new changes with existing change log
      let updatedChangeLog = payment.change_log || '';
      if (changes.length > 0) {
        const newChanges = changes.join('\n');
        updatedChangeLog = updatedChangeLog 
          ? `${updatedChangeLog}\n${newChanges}` 
          : newChanges;
      }

      console.log('Updating payment with data:', {
        payment_date: paymentDate,
        stage,
        amount: parseFloat(amount),
        payment_mode: paymentMode,
        change_log: updatedChangeLog
      });

      // Update the payment record
      const { error } = await supabase
        .from('payments')
        .update({
          payment_date: paymentDate,
          stage,
          amount: parseFloat(amount),
          payment_mode: paymentMode,
          change_log: updatedChangeLog
        })
        .eq('id', payment.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Payment updated successfully');

      toast({
        title: "Success",
        description: "Payment record updated successfully with change history",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: `Failed to update payment record: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Payment Record</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-date" className="text-right">
              Date
            </Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stage" className="text-right">
              Stage
            </Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-mode" className="text-right">
              Payment Mode
            </Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {payment.change_log && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right text-sm font-medium">
                Change History
              </Label>
              <div className="col-span-3 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                <pre className="whitespace-pre-wrap text-gray-700">
                  {payment.change_log}
                </pre>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
