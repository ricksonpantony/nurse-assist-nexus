
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
    status: "Enrolled",
    batch_id: "",
    
    // Financial Information
    total_course_fee: "",
    installments: "1",
    advance_payment: "0",
    payment_status: "Pending",
    payment_method: "Bank Transfer",
    
    // Referral Information
    referral_id: lead.referral_id || "no-referral",
    referral_payment_amount: "0",
    
    // Additional Information
    notes: `Transferred from Lead ID: ${lead.lead_id || 'N/A'}`,
    original_lead_id: lead.lead_id || ""
  });

  const [joinDate, setJoinDate] = useState<Date>(new Date());
  const [classStartDate, setClassStartDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  // Set course fee when course is selected
  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setFormData(prev => ({
      ...prev,
      course_id: courseId,
      total_course_fee: course ? course.fee.toString() : "",
    }));
  };

  const generateStudentId = () => {
    const timestamp = Date.now().toString().slice(-4);
    return `STU-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const studentId = generateStudentId();
      
      const studentData = {
        id: studentId,
        ...formData,
        join_date: format(joinDate, 'yyyy-MM-dd'),
        class_start_date: classStartDate ? format(classStartDate, 'yyyy-MM-dd') : null,
        total_course_fee: parseFloat(formData.total_course_fee) || 0,
        installments: parseInt(formData.installments) || 1,
        advance_payment: parseFloat(formData.advance_payment) || 0,
        referral_payment_amount: parseFloat(formData.referral_payment_amount) || 0,
        // Ensure null values for optional fields
        referral_id: formData.referral_id === "no-referral" ? null : formData.referral_id,
        course_id: formData.course_id === "no-course" ? null : formData.course_id,
        passport_id: formData.passport_id === "" ? null : formData.passport_id,
        address: formData.address === "" ? null : formData.address,
        country: formData.country === "no-country" ? null : formData.country,
        batch_id: formData.batch_id === "" ? null : formData.batch_id,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-2xl text-blue-900 font-bold">
                  Transfer Lead to Student Account
                </DialogTitle>
                <p className="text-sm text-blue-600 mt-1">
                  Complete student enrollment from lead: {lead.lead_id}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-500 rounded"></div>
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                  className="mt-1"
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
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="passport_id">Passport/ID Number</Label>
                <Input
                  id="passport_id"
                  value={formData.passport_id}
                  onChange={(e) => handleInputChange('passport_id', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-country">No Country Selected</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-green-500 rounded"></div>
              Academic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_id">Course *</Label>
                <Select value={formData.course_id} onValueChange={handleCourseChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-course">No Course Selected</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - ${course.fee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enrolled">Enrolled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="batch_id">Batch ID</Label>
                <Input
                  id="batch_id"
                  value={formData.batch_id}
                  onChange={(e) => handleInputChange('batch_id', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., BATCH-2024-01"
                />
              </div>
              <div>
                <Label>Join Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal mt-1")}
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
              <div className="col-span-2">
                <Label>Class Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
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
          </div>

          {/* Financial Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-orange-500 rounded"></div>
              Financial Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="total_course_fee">Total Course Fee *</Label>
                <Input
                  id="total_course_fee"
                  type="number"
                  step="0.01"
                  value={formData.total_course_fee}
                  onChange={(e) => handleInputChange('total_course_fee', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="installments">Installments</Label>
                <Input
                  id="installments"
                  type="number"
                  value={formData.installments}
                  onChange={(e) => handleInputChange('installments', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="advance_payment">Advance Payment</Label>
                <Input
                  id="advance_payment"
                  type="number"
                  step="0.01"
                  value={formData.advance_payment}
                  onChange={(e) => handleInputChange('advance_payment', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select value={formData.payment_status} onValueChange={(value) => handleInputChange('payment_status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Referral Information Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-purple-500 rounded"></div>
              Referral Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referral_id">Referred By</Label>
                <Select value={formData.referral_id} onValueChange={(value) => handleInputChange('referral_id', value)}>
                  <SelectTrigger className="mt-1">
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
              <div>
                <Label htmlFor="referral_payment_amount">Referral Payment Amount</Label>
                <Input
                  id="referral_payment_amount"
                  type="number"
                  step="0.01"
                  value={formData.referral_payment_amount}
                  onChange={(e) => handleInputChange('referral_payment_amount', e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gray-500 rounded"></div>
              Additional Information
            </h3>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="mt-1"
                placeholder="Additional notes about the student transfer..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
            >
              {loading ? 'Transferring...' : 'Complete Transfer to Student Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
