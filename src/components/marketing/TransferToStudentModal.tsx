
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
    installments: "1",
    advance_payment: "0",
    batch_id: "",
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
        installments: parseInt(formData.installments),
        advance_payment: parseFloat(formData.advance_payment),
        referral_id: lead.referral_id,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-blue-900">
              Transfer Lead to Student Account
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Transferring:</strong> {lead.full_name} from lead to student account.
            Please review and complete the student information below.
          </p>
        </div>

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
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="course_id">Course *</Label>
              <Select value={formData.course_id} onValueChange={handleCourseChange}>
                <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
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
              />
            </div>
          </div>

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
              />
            </div>
            <div>
              <Label htmlFor="installments">Installments</Label>
              <Input
                id="installments"
                type="number"
                value={formData.installments}
                onChange={(e) => handleInputChange('installments', e.target.value)}
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
                    className={cn(
                      "w-full justify-start text-left font-normal"
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Transferring...' : 'Transfer to Student Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
