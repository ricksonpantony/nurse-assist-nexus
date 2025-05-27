
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

  const handleUpdatePassword = async () => {
    // Validation
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

    if (passwords.new.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
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
        description: error.message || "Failed to update password.",
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
        <Label htmlFor="current_password">Current Password</Label>
        <Input
          id="current_password"
          type="password"
          value={passwords.current}
          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="new_password">New Password</Label>
        <Input
          id="new_password"
          type="password"
          value={passwords.new}
          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="confirm_password">Confirm New Password</Label>
        <Input
          id="confirm_password"
          type="password"
          value={passwords.confirm}
          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Human Verification */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <Label className="text-sm font-medium text-gray-700">
          Human Verification: What is {humanVerification.question}?
        </Label>
        <Input
          type="number"
          value={humanVerification.userAnswer}
          onChange={(e) => setHumanVerification({ ...humanVerification, userAnswer: e.target.value })}
          className="mt-2"
          placeholder="Enter your answer"
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
