
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/utils/countries';

export const AddStudentForm = ({ student = null, courses = [], onClose, onSave }) => {
  const initialState = student ? { ...student } : {
    full_name: '',
    email: '',
    phone: '',
    passport_id: '',
    address: '',
    country: 'India', // Default to India
    course_id: '',
    batch_id: '',
    referral_id: '',
    join_date: new Date().toISOString().split('T')[0],
    class_start_date: '',
    status: 'Attended Online',
    total_course_fee: 0,
    advance_payment: 0,
    installments: 1,
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (student) {
      // Format dates for input fields
      const updatedStudent = { ...student };
      if (updatedStudent.join_date) {
        updatedStudent.join_date = new Date(updatedStudent.join_date).toISOString().split('T')[0];
      }
      if (updatedStudent.class_start_date) {
        updatedStudent.class_start_date = new Date(updatedStudent.class_start_date).toISOString().split('T')[0];
      }
      setFormData(updatedStudent);
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert numeric fields to numbers
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!formData.full_name || !formData.email || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill in all required fields (name, email, phone)",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      await onSave(formData);
      toast({
        title: "Success",
        description: student ? "Student updated successfully" : "Student added successfully",
      });
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: `Failed to ${student ? 'update' : 'add'} student: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passport_id">Passport ID</Label>
              <Input
                id="passport_id"
                name="passport_id"
                value={formData.passport_id || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
              <Select 
                name="country" 
                value={formData.country || 'India'} 
                onValueChange={(value) => handleSelectChange(value, 'country')}
              >
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
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course_id">Course</Label>
              <Select 
                name="course_id" 
                value={formData.course_id || ''} 
                onValueChange={(value) => handleSelectChange(value, 'course_id')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch_id">Batch</Label>
              <Input
                id="batch_id"
                name="batch_id"
                value={formData.batch_id || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="join_date">Join Date <span className="text-red-500">*</span></Label>
              <Input
                id="join_date"
                name="join_date"
                type="date"
                value={formData.join_date || new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_start_date">Class Start Date</Label>
              <Input
                id="class_start_date"
                name="class_start_date"
                type="date"
                value={formData.class_start_date || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Select 
                name="status" 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange(value, 'status')}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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
            <div className="space-y-2">
              <Label htmlFor="total_course_fee">Total Course Fee <span className="text-red-500">*</span></Label>
              <Input
                id="total_course_fee"
                name="total_course_fee"
                type="number"
                value={formData.total_course_fee}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance_payment">Advance Payment</Label>
              <Input
                id="advance_payment"
                name="advance_payment"
                type="number"
                value={formData.advance_payment || 0}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installments">Installments</Label>
              <Input
                id="installments"
                name="installments"
                type="number"
                min="1"
                value={formData.installments || 1}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
