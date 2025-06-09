import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useReferrals } from "@/hooks/useReferrals";
import { QuickAddReferralModal } from "@/components/students/QuickAddReferralModal";
import { countries } from '@/utils/countries';
import { LEAD_STATUS_OPTIONS } from '@/hooks/useLeads';

export const AddLeadForm = ({ lead = null, courses = [], onClose, onSave }) => {
  const initialState = lead ? { ...lead } : {
    full_name: '',
    email: '',
    phone: '',
    passport_id: '',
    address: '',
    country: 'India', // Default to India
    referral_id: '',
    interested_course_id: '',
    expected_joining_date: '',
    notes: '',
    lead_status: 'New', // Default status
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickAddReferral, setShowQuickAddReferral] = useState(false);
  const { toast } = useToast();
  const { referrals, refetch: refetchReferrals } = useReferrals();

  // Check if lead is converted to student (readonly mode)
  const isConverted = lead?.lead_status === 'Converted to Student';

  useEffect(() => {
    if (lead) {
      console.log('Loading lead data for editing:', lead);
      // Format dates for input fields
      const updatedLead = { ...lead };
      if (updatedLead.expected_joining_date) {
        updatedLead.expected_joining_date = new Date(updatedLead.expected_joining_date).toISOString().split('T')[0];
      }
      setFormData(updatedLead);
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value, name) => {
    console.log('Select field changed:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickAddReferralSuccess = async (newReferral: any) => {
    setFormData(prev => ({
      ...prev,
      referral_id: newReferral.id
    }));
    
    await refetchReferrals();
    
    setShowQuickAddReferral(false);
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

      // Process data - remove course_id if it's "none"
      const processedData = {
        ...formData,
        interested_course_id: formData.interested_course_id === 'none' ? '' : formData.interested_course_id,
        referral_id: formData.referral_id === 'direct' ? null : formData.referral_id,
      };

      console.log('Processed form data before save:', processedData);
      
      await onSave(processedData);
      
      toast({
        title: "Success",
        description: lead ? "Lead updated successfully" : "Lead added successfully",
      });
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: `Failed to ${lead ? 'update' : 'add'} lead: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className={`sm:max-w-[700px] max-h-[90vh] overflow-y-auto ${isConverted ? 'opacity-75' : ''}`}>
        <DialogHeader>
          <DialogTitle>
            {lead ? 'Edit Lead' : 'Add New Lead'}
            {isConverted && <span className="ml-2 text-sm text-purple-600">(Converted to Student)</span>}
          </DialogTitle>
        </DialogHeader>
        
        {isConverted && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              This lead has been converted to a student account and cannot be edited.
            </p>
          </div>
        )}

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

          {/* Simplified Referral Information Section */}
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            {!isConverted && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : lead ? 'Update Lead' : 'Add Lead'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>

      {/* Quick Add Referral Modal */}
      {showQuickAddReferral && (
        <QuickAddReferralModal
          onClose={() => setShowQuickAddReferral(false)}
          onSuccess={handleQuickAddReferralSuccess}
        />
      )}
    </Dialog>
  );
};
