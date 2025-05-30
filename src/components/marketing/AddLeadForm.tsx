
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { countries } from "@/utils/countries";
import { Lead } from "@/hooks/useLeads";
import { Course } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { cn } from "@/lib/utils";

interface AddLeadFormProps {
  lead?: Lead | null;
  courses: Course[];
  onClose: () => void;
  onSave: (leadData: any) => Promise<void>;
}

export const AddLeadForm = ({ lead, courses, onClose, onSave }: AddLeadFormProps) => {
  const { referrals } = useReferrals();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    passport_id: "",
    address: "",
    country: "",
    referral_id: "",
    interested_course_id: "",
    expected_joining_date: "",
    notes: "",
  });
  const [expectedDate, setExpectedDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        full_name: lead.full_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        passport_id: lead.passport_id || "",
        address: lead.address || "",
        country: lead.country || "",
        referral_id: lead.referral_id || "",
        interested_course_id: lead.interested_course_id || "",
        expected_joining_date: lead.expected_joining_date || "",
        notes: lead.notes || "",
      });
      if (lead.expected_joining_date) {
        setExpectedDate(new Date(lead.expected_joining_date));
      }
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const leadData = {
        ...formData,
        expected_joining_date: expectedDate ? format(expectedDate, 'yyyy-MM-dd') : null,
        referral_id: formData.referral_id === "no-referral" ? null : formData.referral_id || null,
        interested_course_id: formData.interested_course_id || null,
      };

      await onSave(leadData);
    } catch (error) {
      console.error('Error saving lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-blue-900">
              {lead ? 'Edit Lead' : 'Add New Lead'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="passport_id">Passport/ID Number</Label>
              <Input
                id="passport_id"
                value={formData.passport_id}
                onChange={(e) => handleInputChange('passport_id', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
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
            <div>
              <Label htmlFor="referral_id">Referred By</Label>
              <Select value={formData.referral_id} onValueChange={(value) => handleInputChange('referral_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select referral (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-referral">No Referral</SelectItem>
                  {referrals.map((referral) => (
                    <SelectItem key={referral.id} value={referral.id}>
                      {referral.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interested_course_id">Interested Course</Label>
              <Select value={formData.interested_course_id} onValueChange={(value) => handleInputChange('interested_course_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expected Joining Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDate ? format(expectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expectedDate}
                    onSelect={setExpectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Internal comments or remarks"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (lead ? 'Update Lead' : 'Add Lead')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
