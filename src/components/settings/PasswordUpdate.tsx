
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PasswordUpdate = () => {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [humanVerification, setHumanVerification] = useState({
    question: '',
    answer: '',
    userAnswer: ''
  });
  const [loading, setLoading] = useState(false);

  // Generate random math question
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let question, answer;
    if (operation === '+') {
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
    } else {
      question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
      answer = Math.max(num1, num2) - Math.min(num1, num2);
    }

    setHumanVerification({
      question,
      answer: answer.toString(),
      userAnswer: ''
    });
  };

  const verifyCurrentPassword = async (currentPassword: string): Promise<boolean> => {
    try {
      // Create a temporary session to verify current password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("User email not found");
      }

      // Try to sign in with current credentials to verify password
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      return !error;
    } catch (error) {
      return false;
    }
  };

  const handleUpdatePassword = async () => {
    // Enhanced validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "Error",
        description: "All password fields are required.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(passwords.new);
    const hasLowerCase = /[a-z]/.test(passwords.new);
    const hasNumbers = /\d/.test(passwords.new);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast({
        title: "Error",
        description: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
        variant: "destructive"
      });
      return;
    }

    if (humanVerification.userAnswer !== humanVerification.answer) {
      toast({
        title: "Error",
        description: "Incorrect answer to verification question.",
        variant: "destructive"
      });
      generateMathQuestion(); // Generate new question
      return;
    }

    setLoading(true);

    try {
      // Verify current password first
      const isCurrentPasswordValid = await verifyCurrentPassword(passwords.current);
      
      if (!isCurrentPasswordValid) {
        toast({
          title: "Error",
          description: "Current password is incorrect.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully!"
      });

      // Reset form
      setPasswords({ current: '', new: '', confirm: '' });
      setHumanVerification({ question: '', answer: '', userAnswer: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  // Generate question when component mounts or when needed
  if (!humanVerification.question) {
    generateMathQuestion();
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="current_password">Current Password <span className="text-red-500">*</span></Label>
        <Input
          id="current_password"
          type="password"
          value={passwords.current}
          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="new_password">New Password <span className="text-red-500">*</span></Label>
        <Input
          id="new_password"
          type="password"
          value={passwords.new}
          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          className="mt-1"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Password must be at least 8 characters with uppercase, lowercase, and numbers.
        </p>
      </div>

      <div>
        <Label htmlFor="confirm_password">Confirm New Password <span className="text-red-500">*</span></Label>
        <Input
          id="confirm_password"
          type="password"
          value={passwords.confirm}
          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      {/* Human Verification */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <Label className="text-sm font-medium text-gray-700">
          Security Verification: What is {humanVerification.question}?
        </Label>
        <Input
          type="number"
          value={humanVerification.userAnswer}
          onChange={(e) => setHumanVerification({ ...humanVerification, userAnswer: e.target.value })}
          className="mt-2"
          placeholder="Enter your answer"
          required
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateMathQuestion}
          className="mt-2"
        >
          Generate New Question
        </Button>
      </div>

      <Button
        onClick={handleUpdatePassword}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
      >
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </div>
  );
};
