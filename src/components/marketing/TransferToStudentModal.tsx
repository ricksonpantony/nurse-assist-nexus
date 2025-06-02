import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Lead } from "@/hooks/useLeads";
import { Course } from "@/hooks/useCourses";
import { cn } from "@/lib/utils";

interface TransferToStudentModalProps {
  lead: Lead;
  courses: Course[];
  onClose: () => void;
  onTransfer: (studentData: any) => Promise<void>;
}

export const TransferToStudentModal = ({ lead, courses, onClose, onTransfer }: TransferToStudentModalProps) => {
  const [formData, setFormData] = useState({
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    passport_id: lead.passport_id || "",
    address: lead.address || "",
    country: lead.country || "",
    course_id: lead.interested_course_id || "",
    status: "Enrolled",
    total_course_fee: "",
    advance_payment: "0",
    batch_id: "",
    referral_payment_amount: "0",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const studentData = {
        ...formData,
        join_date: format(joinDate, 'yyyy-MM-dd'),
        class_start_date: classStartDate ? format(classStartDate, 'yyyy-MM-dd') : null,
        total_course_fee: parseFloat(formData.total_course_fee),
        installments: 1, // Set default value of 1 for installments
        advance_payment: parseFloat(formData.advance_payment),
        referral_id: lead.referral_id,
        referral_payment_amount: parseFloat(formData.referral_payment_amount),
      };

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl text-blue-900 font-bold">
              Transfer Lead to Student Account
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Transferring:</strong> {lead.full_name} ({lead.lead_id}) from lead to student account.
            Please review and complete the student information below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course & Academic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_id">Course *</Label>
                <Select value={formData.course_id} onValueChange={handleCourseChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select course" />
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
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enrolled">Enrolled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
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
                />
              </div>
              <div>
                <Label>Join Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1"
                      )}
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

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>

          {lead.referral_id && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Referral Payment</h3>
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
                <p className="text-sm text-purple-600 mt-2">
                  Amount to be paid to the referral person for this student transfer.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
            >
              {loading ? 'Transferring...' : 'Transfer to Student Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
