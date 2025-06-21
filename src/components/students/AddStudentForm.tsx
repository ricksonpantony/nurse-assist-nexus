import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useReferrals } from "@/hooks/useReferrals";
import { QuickAddReferralModal } from "@/components/students/QuickAddReferralModal";
import { Plus } from "lucide-react";
import { countries } from '@/utils/countries';

export const AddStudentForm = ({ student = null, courses = [], onClose, onSave }) => {
  const { referrals, refetch: refetchReferrals } = useReferrals();
  const [showQuickAddReferral, setShowQuickAddReferral] = useState(false);

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
    advance_payment_method: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const paymentMethods = [
    'Bank Transfer',
    'Card Payments',
    'Stripe Account',
    'PayID',
    'International Account',
    'Others'
  ];

  useEffect(() => {
    if (student) {
      console.log('Loading student data for editing:', student);
      console.log('Student country from data:', student.country);
      
      // Format dates for input fields
      const updatedStudent = { ...student };
      if (updatedStudent.join_date) {
        updatedStudent.join_date = new Date(updatedStudent.join_date).toISOString().split('T')[0];
      }
      if (updatedStudent.class_start_date) {
        updatedStudent.class_start_date = new Date(updatedStudent.class_start_date).toISOString().split('T')[0];
      }
      
      // Clean and trim the country value
      const cleanCountry = updatedStudent.country ? updatedStudent.country.trim() : '';
      
      setFormData({
        ...updatedStudent,
        advance_payment_method: updatedStudent.advance_payment_method || '',
        notes: updatedStudent.notes || '',
        // Properly set country from student data, ensuring it's trimmed and not empty
        country: cleanCountry !== '' ? cleanCountry : 'India',
      });
      
      console.log('Form data country set to:', cleanCountry !== '' ? cleanCountry : 'India');
    }
  }, [student]);

  // Auto-populate course fee when course is selected
  useEffect(() => {
    if (formData.course_id && formData.course_id !== 'none') {
      const selectedCourse = courses.find(course => course.id === formData.course_id);
      if (selectedCourse && selectedCourse.fee) {
        console.log('Auto-populating course fee:', selectedCourse.fee);
        setFormData(prev => ({
          ...prev,
          total_course_fee: selectedCourse.fee
        }));
      }
    }
  }, [formData.course_id, courses]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    console.log('Form field changed:', name, value);
    
    // Convert numeric fields to numbers
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (value, name) => {
    console.log('Select field changed:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickAddReferralSuccess = async (newReferral: any) => {
    // Refresh the referrals list
    await refetchReferrals();
    
    // Set the newly created referral as selected
    setFormData(prev => ({
      ...prev,
      referral_id: newReferral.id
    }));
    
    setShowQuickAddReferral(false);
    
    toast({
      title: "Success",
      description: "Referral added successfully and selected",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
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

      // Ensure numeric fields are properly converted and handle empty date fields
      const processedData = {
        ...formData,
        total_course_fee: Number(formData.total_course_fee) || 0,
        advance_payment: Number(formData.advance_payment) || 0,
        // Remove course_id if it's "none" to store as null/empty
        course_id: formData.course_id === 'none' ? null : formData.course_id,
        // Handle empty dates - set to null instead of empty string
        class_start_date: formData.class_start_date === '' ? null : formData.class_start_date,
        // Ensure join_date is never empty
        join_date: formData.join_date || new Date().toISOString().split('T')[0],
        // Include payment method only if advance payment is made
        advance_payment_method: formData.advance_payment_method || null,
        // Handle notes
        notes: formData.notes || null,
        // Trim country to avoid trailing spaces
        country: formData.country ? formData.country.trim() : null,
      };

      console.log('Processed form data before save:', processedData);
      
      await onSave(processedData);
      
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
    <>
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passport_id">Passport ID</Label>
                <Input
                  id="passport_id"
                  name="passport_id"
                  value={formData.passport_id || ''}
                  onChange={handleChange}
                  placeholder="Enter passport ID"
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
                  <SelectContent className="max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg z-50">
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
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course_id">Course</Label>
                <Select 
                  name="course_id" 
                  value={formData.course_id || 'none'} 
                  onValueChange={(value) => handleSelectChange(value, 'course_id')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="none">None</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - ${course.fee}
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
                  placeholder="Enter batch ID"
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

            {/* Referral Section */}
            <div className="space-y-2">
              <Label htmlFor="referral_id">Referred By</Label>
              <div className="flex gap-2">
                <Select 
                  name="referral_id" 
                  value={formData.referral_id || 'direct'} 
                  onValueChange={(value) => handleSelectChange(value, 'referral_id')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select referral source" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="direct">Direct (No Referral)</SelectItem>
                    {referrals.map((referral) => (
                      <SelectItem key={referral.id} value={referral.id}>
                        {referral.full_name} ({referral.referral_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickAddReferral(true)}
                  className="gap-1 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <Select 
                  name="status" 
                  value={formData.status || 'Attended Online'} 
                  onValueChange={(value) => handleSelectChange(value, 'status')}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
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
                  min="0"
                  step="0.01"
                  value={formData.total_course_fee || 0}
                  onChange={handleChange}
                  required
                  placeholder="Enter total course fee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance_payment">Advance Payment</Label>
                <Input
                  id="advance_payment"
                  name="advance_payment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.advance_payment || 0}
                  onChange={handleChange}
                  placeholder="Enter advance payment"
                />
              </div>
              {Number(formData.advance_payment) > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="advance_payment_method">Advance Payment Method</Label>
                  <Select 
                    name="advance_payment_method" 
                    value={formData.advance_payment_method || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'advance_payment_method')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Enter any additional notes about the student"
              />
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

      {/* Quick Add Referral Modal */}
      {showQuickAddReferral && (
        <QuickAddReferralModal
          onClose={() => setShowQuickAddReferral(false)}
          onSuccess={handleQuickAddReferralSuccess}
        />
      )}
    </>
  );
};
