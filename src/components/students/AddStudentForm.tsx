
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Course } from "@/hooks/useCourses";
import { Student } from "@/hooks/useStudents";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReferrals } from "@/hooks/useReferrals";
import { QuickAddReferralModal } from "./QuickAddReferralModal";
import { PersonalInfoForm } from "./form/PersonalInfoForm";
import { ReferralInfoForm } from "./form/ReferralInfoForm";
import { CourseInfoForm } from "./form/CourseInfoForm";
import { PaymentInfoForm } from "./form/PaymentInfoForm";

interface AddStudentFormProps {
  student?: Student;
  courses: Course[];
  onClose: () => void;
  onSave: (student: any) => void;
}

export const AddStudentForm = ({ student, courses, onClose, onSave }: AddStudentFormProps) => {
  const isMobile = useIsMobile();
  const { referrals } = useReferrals();
  const [showQuickAddReferral, setShowQuickAddReferral] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    country: "India", // Default to India
    passport_id: "",
    course_id: "",
    batch_id: "",
    referral_id: "",
    referral_payment_amount: 0,
    join_date: new Date().toISOString().split('T')[0],
    class_start_date: "",
    status: "Attend sessions" as Student['status'],
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
        country: student.country || "India", // Default to India if not set
        passport_id: student.passport_id || "",
        course_id: student.course_id || "",
        batch_id: student.batch_id || "",
        referral_id: student.referral_id || "",
        referral_payment_amount: 0, // Reset for editing
        join_date: student.join_date,
        class_start_date: student.class_start_date || "",
        status: student.status,
        total_course_fee: student.total_course_fee,
        advance_payment: student.advance_payment,
        installments: student.installments
      });
    }
  }, [student]);

  // Auto-populate course fee when course is selected (only if not manually edited)
  useEffect(() => {
    if (formData.course_id && !student) {
      const selectedCourse = courses.find(c => c.id === formData.course_id);
      if (selectedCourse) {
        setFormData(prev => ({ ...prev, total_course_fee: selectedCourse.fee }));
      }
    }
  }, [formData.course_id, courses, student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for submission, converting empty strings to null for optional fields
    const submitData: any = {
      ...formData,
      class_start_date: formData.class_start_date || null,
      address: formData.address || null,
      passport_id: formData.passport_id || null,
      course_id: formData.course_id || null,
      batch_id: formData.batch_id || null,
      referral_id: formData.referral_id === "direct" ? null : formData.referral_id || null,
      referral_payment_amount: formData.referral_payment_amount || 0
    };

    // If editing, include the student ID
    if (student) {
      submitData.id = student.id;
    }
    
    onSave(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReferralSelect = (value: string) => {
    if (value === "add_new") {
      setShowQuickAddReferral(true);
    } else {
      handleInputChange("referral_id", value);
    }
  };

  const handleQuickReferralAdded = (newReferral: any) => {
    handleInputChange("referral_id", newReferral.id);
    setShowQuickAddReferral(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Auto-generated ID display for edit mode */}
      {student && (
        <div>
          <Input value={student.id} disabled className="bg-gray-100" />
        </div>
      )}

      {/* Personal Information */}
      <PersonalInfoForm 
        formData={formData} 
        onFieldChange={handleInputChange} 
        isMobile={isMobile} 
      />

      {/* Referral Information */}
      <ReferralInfoForm
        formData={formData}
        referrals={referrals}
        onFieldChange={handleInputChange}
        onAddNewReferral={() => setShowQuickAddReferral(true)}
      />

      {/* Course Information */}
      <CourseInfoForm
        formData={formData}
        courses={courses}
        onFieldChange={handleInputChange}
        isMobile={isMobile}
      />

      {/* Payment Information */}
      <PaymentInfoForm
        formData={formData}
        onFieldChange={handleInputChange}
        isMobile={isMobile}
      />

      {/* Form Actions */}
      <div className={`flex gap-3 pt-4 ${isMobile ? "flex-col" : "justify-end"}`}>
        <Button type="button" variant="outline" onClick={onClose} className={isMobile ? "w-full" : ""}>
          Cancel
        </Button>
        <Button type="submit" className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ${isMobile ? "w-full" : ""}`}>
          {student ? "Update Student" : "Add Student"}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {student ? "Edit Student" : "Add New Student"}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            {formContent}
          </div>
        </div>

        {/* Quick Add Referral Modal */}
        {showQuickAddReferral && (
          <QuickAddReferralModal
            isOpen={showQuickAddReferral}
            onClose={() => setShowQuickAddReferral(false)}
            onReferralAdded={handleQuickReferralAdded}
          />
        )}
      </>
    );
  }

  return (
    <>
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
            {formContent}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Referral Modal */}
      {showQuickAddReferral && (
        <QuickAddReferralModal
          isOpen={showQuickAddReferral}
          onClose={() => setShowQuickAddReferral(false)}
          onReferralAdded={handleQuickReferralAdded}
        />
      )}
    </>
  );
};
