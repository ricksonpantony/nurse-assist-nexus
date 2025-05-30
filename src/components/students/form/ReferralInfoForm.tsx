
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Referral } from "@/hooks/useReferrals";

interface ReferralInfoFormProps {
  formData: {
    referral_id: string;
    referral_payment_amount: number;
  };
  referrals: Referral[];
  onFieldChange: (field: string, value: any) => void;
  onAddNewReferral: () => void;
}

export const ReferralInfoForm = ({ formData, referrals, onFieldChange, onAddNewReferral }: ReferralInfoFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="referral_id">Referred By</Label>
        <Select value={formData.referral_id} onValueChange={(value) => onFieldChange("referral_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select referral person (Optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="direct">Direct (No Referral)</SelectItem>
            {referrals.map((referral) => (
              <SelectItem key={referral.id} value={referral.id}>
                {referral.full_name}
              </SelectItem>
            ))}
            <SelectItem value="add_new" className="text-blue-600 font-medium">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Referral Person
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Referral Payment Amount - Only show if a referral person is selected */}
      {formData.referral_id && formData.referral_id !== "direct" && (
        <div>
          <Label htmlFor="referral_payment_amount">Referral Payment Amount Paid ($)</Label>
          <Input
            id="referral_payment_amount"
            type="number"
            value={formData.referral_payment_amount}
            onChange={(e) => onFieldChange("referral_payment_amount", Number(e.target.value))}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          <p className="text-sm text-gray-500 mt-1">Optional - Payment made to the referral person</p>
        </div>
      )}
    </div>
  );
};
