
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/utils/countries";

interface PersonalInfoFormProps {
  formData: {
    full_name: string;
    email: string;
    phone: string;
    passport_id: string;
    address: string;
    country: string;
  };
  onFieldChange: (field: string, value: any) => void;
  isMobile: boolean;
}

export const PersonalInfoForm = ({ formData, onFieldChange, isMobile }: PersonalInfoFormProps) => {
  return (
    <>
      <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => onFieldChange("full_name", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            required
          />
        </div>
      </div>

      <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="passport_id">Passport ID</Label>
          <Input
            id="passport_id"
            value={formData.passport_id}
            onChange={(e) => onFieldChange("passport_id", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onFieldChange("address", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="country">Country *</Label>
        <Select value={formData.country} onValueChange={(value) => onFieldChange("country", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
