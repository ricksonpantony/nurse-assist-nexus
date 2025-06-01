
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useLeads, LEAD_STATUS_OPTIONS, Lead } from "@/hooks/useLeads";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { QuickAddReferralModal } from "@/components/students/QuickAddReferralModal";
import { countries } from '@/utils/countries';

const MarketingManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, addLead, updateLead } = useLeads();
  const { courses } = useCourses();
  const { referrals, addReferralPayment } = useReferrals();
  const { toast } = useToast();

  const isEditing = !!id;
  const lead = isEditing ? leads.find(l => l.id === id) : null;

  const initialState = {
    full_name: '',
    email: '',
    phone: '',
    passport_id: '',
    address: '',
    country: 'India',
    referral_id: '',
    interested_course_id: '',
    expected_joining_date: '',
    notes: '',
    lead_status: 'New',
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickAddReferral, setShowQuickAddReferral] = useState(false);
  const [referralPaymentAmount, setReferralPaymentAmount] = useState('');

  const isConverted = lead?.lead_status === 'Converted to Student';

  useEffect(() => {
    if (lead) {
      const updatedLead = { ...lead };
      if (updatedLead.expected_joining_date) {
        updatedLead.expected_joining_date = new Date(updatedLead.expected_joining_date).toISOString().split('T')[0];
      }
      setFormData(updatedLead);
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value, name) => {
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

  const handleAddReferralPayment = async () => {
    if (!formData.referral_id || formData.referral_id === 'direct' || !referralPaymentAmount) {
      toast({
        title: "Error",
        description: "Please select a referral and enter a payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const paymentData = {
        referral_id: formData.referral_id,
        student_id: lead?.lead_id || 'LEAD-TEMP',
        amount: parseFloat(referralPaymentAmount),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        notes: `Payment for lead: ${formData.full_name}`,
      };

      await addReferralPayment(paymentData);
      setReferralPaymentAmount('');
      toast({
        title: "Success",
        description: "Referral payment added successfully",
      });
    } catch (error) {
      console.error('Error adding referral payment:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        interested_course_id: formData.interested_course_id === 'none' ? '' : formData.interested_course_id,
        referral_id: formData.referral_id === 'direct' ? null : formData.referral_id,
      };

      if (isEditing) {
        await updateLead(id, processedData);
        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
      } else {
        await addLead(processedData);
        toast({
          title: "Success",
          description: "Lead added successfully",
        });
      }
      
      navigate('/marketing');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} lead: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedReferral = referrals.find(r => r.id === formData.referral_id);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/marketing')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketing
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              {isEditing ? 'Edit Lead' : 'Add New Lead'}
              {isConverted && <span className="ml-2 text-sm text-purple-600">(Converted to Student)</span>}
            </h1>
            <p className="text-sm text-blue-600">
              {isEditing ? `Editing ${lead?.full_name}` : 'Create a new marketing lead'}
            </p>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {isConverted && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  This lead has been converted to a student account and cannot be edited.
                </p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        disabled={isConverted}
                        className={isConverted ? 'bg-gray-100' : ''}
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
                        disabled={isConverted}
                        className={isConverted ? 'bg-gray-100' : ''}
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
                        disabled={isConverted}
                        className={isConverted ? 'bg-gray-100' : ''}
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
                        disabled={isConverted}
                        className={isConverted ? 'bg-gray-100' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                      <Select 
                        name="country" 
                        value={formData.country || 'India'} 
                        onValueChange={(value) => handleSelectChange(value, 'country')}
                        disabled={isConverted}
                      >
                        <SelectTrigger className={isConverted ? 'bg-gray-100' : ''}>
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
                        disabled={isConverted}
                        className={isConverted ? 'bg-gray-100' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interested_course_id">Interested Course</Label>
                      <Select 
                        name="interested_course_id" 
                        value={formData.interested_course_id || 'none'} 
                        onValueChange={(value) => handleSelectChange(value, 'interested_course_id')}
                        disabled={isConverted}
                      >
                        <SelectTrigger className={isConverted ? 'bg-gray-100' : ''}>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          <SelectItem value="none">None</SelectItem>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expected_joining_date">Expected Joining Date</Label>
                      <Input
                        id="expected_joining_date"
                        name="expected_joining_date"
                        type="date"
                        value={formData.expected_joining_date || ''}
                        onChange={handleChange}
                        placeholder="Select expected joining date"
                        disabled={isConverted}
                        className={isConverted ? 'bg-gray-100' : ''}
                      />
                    </div>
                  </div>

                  {/* Referral Information Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-blue-900">Referral Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="referral_id">Referred By</Label>
                        <div className="flex gap-2">
                          <Select 
                            name="referral_id" 
                            value={formData.referral_id || 'direct'} 
                            onValueChange={(value) => handleSelectChange(value, 'referral_id')}
                            disabled={isConverted}
                          >
                            <SelectTrigger className={isConverted ? 'bg-gray-100' : ''}>
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
                          {!isConverted && (
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
                          )}
                        </div>
                      </div>

                      {/* Referral Payment Section */}
                      {formData.referral_id && formData.referral_id !== 'direct' && selectedReferral && !isConverted && (
                        <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">Selected Referral</p>
                              <p className="text-sm text-blue-700">{selectedReferral.full_name} ({selectedReferral.referral_id})</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="referral_payment_amount">Referral Payment Amount</Label>
                            <div className="flex gap-2">
                              <Input
                                id="referral_payment_amount"
                                type="number"
                                step="0.01"
                                value={referralPaymentAmount}
                                onChange={(e) => setReferralPaymentAmount(e.target.value)}
                                placeholder="Enter payment amount"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddReferralPayment}
                                disabled={!referralPaymentAmount}
                                className="gap-1 shrink-0"
                              >
                                <Plus className="h-4 w-4" />
                                Add Payment
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="lead_status">Lead Status <span className="text-red-500">*</span></Label>
                    <Select 
                      name="lead_status" 
                      value={formData.lead_status || 'New'} 
                      onValueChange={(value) => handleSelectChange(value, 'lead_status')}
                      disabled={isConverted}
                    >
                      <SelectTrigger className={isConverted ? 'bg-gray-100' : ''}>
                        <SelectValue placeholder="Select lead status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        {LEAD_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter any additional notes"
                      disabled={isConverted}
                      className={isConverted ? 'bg-gray-100' : ''}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/marketing')} 
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    {!isConverted && (
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : isEditing ? 'Update Lead' : 'Add Lead'}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Quick Add Referral Modal */}
      {showQuickAddReferral && (
        <QuickAddReferralModal
          onClose={() => setShowQuickAddReferral(false)}
          onSuccess={handleQuickAddReferralSuccess}
        />
      )}
    </div>
  );
};

export default MarketingManage;
