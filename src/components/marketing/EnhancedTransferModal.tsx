
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Lead } from "@/hooks/useLeads";
import { Course } from "@/hooks/useCourses";
import { cn } from "@/lib/utils";
import { countries } from "@/utils/countries";

interface EnhancedTransferModalProps {
  lead: Lead;
  courses: Course[];
  referrals: any[];
  onClose: () => void;
  onTransfer: (studentData: any) => Promise<void>;
}

export const EnhancedTransferModal = ({ lead, courses, referrals, onClose, onTransfer }: EnhancedTransferModalProps) => {
  // Set initial course fee if course is already selected
  const initialCourse = courses.find(c => c.id === lead.interested_course_id);
  
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    passport_id: lead.passport_id || "",
    address: lead.address || "",
    country: lead.country || "",
    
    // Academic Information
    course_id: lead.interested_course_id || "",
    status: "Attend sessions",
    batch_id: "",
    
    // Financial Information
    total_course_fee: initialCourse ? initialCourse.fee.toString() : "",
    advance_payment: "0",
    advance_payment_method: "",
    
    // Referral Information
    referral_id: lead.referral_id || "no-referral",
    referral_payment_amount: "0",
    
    // Notes
    notes: lead.notes || "",
  });

  const [joinDate, setJoinDate] = useState<Date>(new Date());
  const [classStartDate, setClassStartDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    'Bank Transfer',
    'Card Payments',
    'Stripe Account',
    'PayID',
    'International Account',
    'Others'
  ];

  // Set course fee when course is selected
  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    console.log('Course selected:', course);
    setFormData(prev => ({
      ...prev,
      course_id: courseId,
      total_course_fee: course ? course.fee.toString() : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const studentData = {
        ...formData,
        join_date: format(joinDate, 'yyyy-MM-dd'),
        class_start_date: classStartDate ? format(classStartDate, 'yyyy-MM-dd') : null,
        total_course_fee: parseFloat(formData.total_course_fee) || 0,
        advance_payment: parseFloat(formData.advance_payment) || 0,
        referral_payment_amount: parseFloat(formData.referral_payment_amount) || 0,
        installments: 1, // Always set to 1 since we removed installment options
        // Ensure null values for optional fields
        referral_id: formData.referral_id === "no-referral" ? null : formData.referral_id,
        course_id: formData.course_id === "no-course" ? null : formData.course_id,
        passport_id: formData.passport_id === "" ? null : formData.passport_id,
        address: formData.address === "" ? null : formData.address,
        country: formData.country === "no-country" ? null : formData.country,
        batch_id: formData.batch_id === "" ? null : formData.batch_id,
        advance_payment_method: formData.advance_payment_method || null,
        notes: formData.notes || null,
      };

      console.log('Transferring student data:', studentData);
      await onTransfer(studentData);
    } catch (error) {
      console.error('Error transferring lead to student:', error);
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
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-xl text-blue-900">
                Transfer Lead to Student Account
              </DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Transferring:</strong> {lead.full_name} ({lead.lead_id}) from lead to student account.
            Please review and complete the student information below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
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
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="passport_id">Passport ID</Label>
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

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
            />
          </div>

          {/* Referral Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="referral_id">Referred By</Label>
              <Select value={formData.referral_id} onValueChange={(value) => handleInputChange('referral_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select referral person (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-referral">Direct (No Referral)</SelectItem>
                  {referrals.map((referral) => (
                    <SelectItem key={referral.id} value={referral.id}>
                      {referral.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Referral Payment Amount - Only show if a referral person is selected */}
            {formData.referral_id && formData.referral_id !== "no-referral" && (
              <div>
                <Label htmlFor="referral_payment_amount">Referral Payment Amount Paid ($)</Label>
                <Input
                  id="referral_payment_amount"
                  type="number"
                  value={formData.referral_payment_amount}
                  onChange={(e) => handleInputChange('referral_payment_amount', e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">Optional - Payment made to the referral person</p>
              </div>
            )}
          </div>

          {/* Course Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course_id">Course *</Label>
              <Select value={formData.course_id} onValueChange={handleCourseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} - ${course.fee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batch_id">Batch ID</Label>
              <Input
                id="batch_id"
                value={formData.batch_id}
                onChange={(e) => handleInputChange('batch_id', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Join Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(joinDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={joinDate}
                    onSelect={(date) => date && setJoinDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Class Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !classStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {classStartDate ? format(classStartDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={classStartDate}
                    onSelect={setClassStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Attended Online">Attended Online</SelectItem>
                <SelectItem value="Attend sessions">Attend sessions</SelectItem>
                <SelectItem value="Attended F2F">Attended F2F</SelectItem>
                <SelectItem value="Exam cycle">Exam cycle</SelectItem>
                <SelectItem value="Awaiting results">Awaiting results</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_course_fee">Total Course Fee *</Label>
              <Input
                id="total_course_fee"
                type="number"
                value={formData.total_course_fee}
                onChange={(e) => handleInputChange('total_course_fee', e.target.value)}
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
                onChange={(e) => handleInputChange('advance_payment', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Payment Method - Only show if advance payment > 0 */}
          {parseFloat(formData.advance_payment) > 0 && (
            <div>
              <Label htmlFor="advance_payment_method">Advance Payment Method</Label>
              <Select value={formData.advance_payment_method} onValueChange={(value) => handleInputChange('advance_payment_method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Enter any additional notes about the student"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {loading ? 'Transferring...' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
