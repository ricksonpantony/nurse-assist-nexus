import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useCourses } from "@/hooks/useCourses";
import { useStudents, Student } from "@/hooks/useStudents";
import { useReferrals } from "@/hooks/useReferrals";
import { QuickAddReferralModal } from "@/components/students/QuickAddReferralModal";
import { countries } from '@/utils/countries';

const ManageStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { courses } = useCourses();
  const { students, addStudent, updateStudent } = useStudents();
  const { referrals } = useReferrals();
  const { toast } = useToast();
  
  const isEditing = !!id;
  const currentStudent = isEditing ? students.find(s => s.id === id) : null;

  const initialState = {
    full_name: '',
    email: '',
    phone: '',
    passport_id: '',
    address: '',
    country: 'India',
    course_id: '',
    batch_id: '',
    referral_id: '',
    join_date: new Date().toISOString().split('T')[0],
    class_start_date: '',
    status: 'Enrolled' as Student['status'],
    total_course_fee: 0,
    advance_payment: 0,
    advance_payment_method: '',
    referral_payment_amount: 0,
    notes: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickAddReferral, setShowQuickAddReferral] = useState(false);

  const paymentMethods = [
    'Bank Transfer',
    'Card Payments',
    'Stripe Account',
    'PayID',
    'International Account',
    'Others'
  ];

  useEffect(() => {
    if (isEditing && currentStudent) {
      console.log('Loading student data for editing:', currentStudent);
      const updatedStudent = { ...currentStudent };
      if (updatedStudent.join_date) {
        updatedStudent.join_date = new Date(updatedStudent.join_date).toISOString().split('T')[0];
      }
      if (updatedStudent.class_start_date) {
        updatedStudent.class_start_date = new Date(updatedStudent.class_start_date).toISOString().split('T')[0];
      }
      setFormData({
        ...updatedStudent,
        course_id: updatedStudent.course_id || '',
        referral_id: updatedStudent.referral_id || '',
        advance_payment_method: updatedStudent.advance_payment_method || '',
        referral_payment_amount: 0,
        notes: updatedStudent.notes || '',
      });
    }
  }, [isEditing, currentStudent]);

  useEffect(() => {
    if (formData.course_id && formData.course_id !== 'none' && formData.course_id !== '') {
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

  const handleQuickAddReferralSuccess = (newReferral: any) => {
    setFormData(prev => ({
      ...prev,
      referral_id: newReferral.id
    }));
    setShowQuickAddReferral(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsLoading(true);
    
    try {
      if (!formData.full_name || !formData.email || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill in all required fields (name, email, phone)",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const processedData = {
        ...formData,
        total_course_fee: Number(formData.total_course_fee) || 0,
        advance_payment: Number(formData.advance_payment) || 0,
        referral_payment_amount: Number(formData.referral_payment_amount) || 0,
        course_id: formData.course_id === 'none' || formData.course_id === '' ? null : formData.course_id,
        referral_id: formData.referral_id === '' ? null : formData.referral_id,
        class_start_date: formData.class_start_date === '' ? null : formData.class_start_date,
        join_date: formData.join_date || new Date().toISOString().split('T')[0],
        advance_payment_method: formData.advance_payment_method || null,
        notes: formData.notes || null,
      };

      console.log('Processed form data before save:', processedData);
      
      if (isEditing) {
        await updateStudent(id!, processedData);
      } else {
        await addStudent(processedData);
      }
      
      navigate('/students');
    } catch (error) {
      console.error('Error saving student:', error);
      // Error is already handled in the hooks
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
          <Button
            variant="ghost"
            onClick={() => navigate('/students')}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              {isEditing ? 'Edit Student' : 'Add New Student'}
            </h1>
            <p className="text-sm text-blue-600">
              {isEditing ? 'Update student information and course details' : 'Enter student information and course assignment'}
            </p>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : isEditing ? 'Update Student' : 'Save Student'}
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-800">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
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
                      value={formData.email}
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
                      value={formData.phone}
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
                      value={formData.passport_id}
                      onChange={handleChange}
                      placeholder="Enter passport ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                    <Select 
                      name="country" 
                      value={formData.country} 
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
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                {/* Course Information */}
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
                      value={formData.batch_id}
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
                      value={formData.join_date}
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
                      value={formData.class_start_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Status and Fee Information */}
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
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="Enrolled">Enrolled</SelectItem>
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
                      value={formData.total_course_fee}
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
                      value={formData.advance_payment}
                      onChange={handleChange}
                      placeholder="Enter advance payment"
                    />
                  </div>
                  {Number(formData.advance_payment) > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="advance_payment_method">Advance Payment Method</Label>
                      <Select 
                        name="advance_payment_method" 
                        value={formData.advance_payment_method} 
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

                {/* Referral Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referral_id">Referral</Label>
                    <div className="flex gap-2">
                      <Select 
                        name="referral_id" 
                        value={formData.referral_id || ''} 
                        onValueChange={(value) => handleSelectChange(value, 'referral_id')}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select referral (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          <SelectItem value="">No Referral (Direct)</SelectItem>
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
                        onClick={() => setShowQuickAddReferral(true)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {formData.referral_id && (
                    <div className="space-y-2">
                      <Label htmlFor="referral_payment_amount">Referral Payment Amount</Label>
                      <Input
                        id="referral_payment_amount"
                        name="referral_payment_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.referral_payment_amount}
                        onChange={handleChange}
                        placeholder="Enter referral payment amount"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter any additional notes about the student"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Quick Add Referral Modal */}
      {showQuickAddReferral && (
        <QuickAddReferralModal
          isOpen={showQuickAddReferral}
          onClose={() => setShowQuickAddReferral(false)}
          onSuccess={handleQuickAddReferralSuccess}
        />
      )}
    </div>
  );
};

export default ManageStudent;
