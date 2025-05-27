
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface Course {
  id: string;
  title: string;
  fee: number;
}

interface AddStudentFormProps {
  student?: any;
  courses: Course[];
  onClose: () => void;
  onSave: (student: any) => void;
}

export const AddStudentForm = ({ student, courses, onClose, onSave }: AddStudentFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    passportId: "",
    courseId: "",
    batchId: "",
    joinDate: new Date().toISOString().split('T')[0],
    classStartDate: "",
    status: "enrolled",
    totalCourseFee: 0,
    advancePayment: 0,
    installments: 1
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  useEffect(() => {
    if (formData.courseId) {
      const selectedCourse = courses.find(c => c.id === formData.courseId);
      if (selectedCourse) {
        setFormData(prev => ({ ...prev, totalCourseFee: selectedCourse.fee }));
      }
    }
  }, [formData.courseId, courses]);

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
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
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
                <Label htmlFor="passportId">Passport ID</Label>
                <Input
                  id="passportId"
                  value={formData.passportId}
                  onChange={(e) => handleInputChange("passportId", e.target.value)}
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
                <Label htmlFor="courseId">Course *</Label>
                <Select value={formData.courseId} onValueChange={(value) => handleInputChange("courseId", value)}>
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
                <Label htmlFor="batchId">Batch ID</Label>
                <Input
                  id="batchId"
                  value={formData.batchId}
                  onChange={(e) => handleInputChange("batchId", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="joinDate">Join Date *</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleInputChange("joinDate", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="classStartDate">Class Start Date</Label>
                <Input
                  id="classStartDate"
                  type="date"
                  value={formData.classStartDate}
                  onChange={(e) => handleInputChange("classStartDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
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
                <Label htmlFor="totalCourseFee">Total Course Fee</Label>
                <Input
                  id="totalCourseFee"
                  type="number"
                  value={formData.totalCourseFee}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="advancePayment">Advance Payment</Label>
                <Input
                  id="advancePayment"
                  type="number"
                  value={formData.advancePayment}
                  onChange={(e) => handleInputChange("advancePayment", Number(e.target.value))}
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
