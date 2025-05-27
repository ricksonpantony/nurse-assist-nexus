
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Course } from "@/hooks/useCourses";
import { Student } from "@/hooks/useStudents";

interface AddStudentFormProps {
  student?: Student;
  courses: Course[];
  onClose: () => void;
  onSave: (student: any) => void;
}

export const AddStudentForm = ({ student, courses, onClose, onSave }: AddStudentFormProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    passport_id: "",
    course_id: "",
    batch_id: "",
    join_date: new Date().toISOString().split('T')[0],
    class_start_date: "",
    status: "enrolled" as const,
    total_course_fee: 0,
    advance_payment: 0,
    installments: 1
  });

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        address: student.address || "",
        country: student.country || "",
        passport_id: student.passport_id || "",
        course_id: student.course_id || "",
        batch_id: student.batch_id || "",
        join_date: student.join_date,
        class_start_date: student.class_start_date || "",
        status: student.status,
        total_course_fee: student.total_course_fee,
        advance_payment: student.advance_payment,
        installments: student.installments
      });
    }
  }, [student]);

  useEffect(() => {
    if (formData.course_id) {
      const selectedCourse = courses.find(c => c.id === formData.course_id);
      if (selectedCourse) {
        setFormData(prev => ({ ...prev, total_course_fee: selectedCourse.fee }));
      }
    }
  }, [formData.course_id, courses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl text-blue-900">
            {student ? "Edit Student" : "Add New Student"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auto-generated ID display for edit mode */}
            {student && (
              <div>
                <Label>Student ID</Label>
                <Input value={student.id} disabled className="bg-gray-100" />
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
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
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="passport_id">Passport ID</Label>
                <Input
                  id="passport_id"
                  value={formData.passport_id}
                  onChange={(e) => handleInputChange("passport_id", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              />
            </div>

            {/* Course Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_id">Course *</Label>
                <Select value={formData.course_id} onValueChange={(value) => handleInputChange("course_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
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
                <Label htmlFor="batch_id">Batch ID</Label>
                <Input
                  id="batch_id"
                  value={formData.batch_id}
                  onChange={(e) => handleInputChange("batch_id", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="join_date">Join Date *</Label>
                <Input
                  id="join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => handleInputChange("join_date", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="class_start_date">Class Start Date</Label>
                <Input
                  id="class_start_date"
                  type="date"
                  value={formData.class_start_date}
                  onChange={(e) => handleInputChange("class_start_date", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awaiting-course">Awaiting Course</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="face-to-face">Face to Face</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="total_course_fee">Total Course Fee</Label>
                <Input
                  id="total_course_fee"
                  type="number"
                  value={formData.total_course_fee}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="advance_payment">Advance Payment</Label>
                <Input
                  id="advance_payment"
                  type="number"
                  value={formData.advance_payment}
                  onChange={(e) => handleInputChange("advance_payment", Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="installments">Installments</Label>
                <Select value={String(formData.installments)} onValueChange={(value) => handleInputChange("installments", Number(value))}>
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

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                {student ? "Update Student" : "Add Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
