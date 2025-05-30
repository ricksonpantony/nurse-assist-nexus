
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentInfoFormProps {
  formData: {
    total_course_fee: number;
    advance_payment: number;
    installments: number;
  };
  onFieldChange: (field: string, value: any) => void;
  isMobile: boolean;
}

export const PaymentInfoForm = ({ formData, onFieldChange, isMobile }: PaymentInfoFormProps) => {
  return (
    <div className={isMobile ? "space-y-4" : "grid grid-cols-3 gap-4"}>
      <div>
        <Label htmlFor="total_course_fee">Total Course Fee *</Label>
        <Input
          id="total_course_fee"
          type="number"
          value={formData.total_course_fee}
          onChange={(e) => onFieldChange("total_course_fee", Number(e.target.value))}
          required
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="advance_payment">Advance Payment</Label>
        <Input
          id="advance_payment"
          type="number"
          value={formData.advance_payment}
          onChange={(e) => onFieldChange("advance_payment", Number(e.target.value))}
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="installments">Installments</Label>
        <Select value={String(formData.installments)} onValueChange={(value) => onFieldChange("installments", Number(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <SelectItem key={num} value={String(num)}>{num}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
