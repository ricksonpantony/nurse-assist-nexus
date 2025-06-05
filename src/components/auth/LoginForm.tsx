
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Building2, Mail, LogIn, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Number verification states
  const [num1, setNum1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2, setNum2] = useState(Math.floor(Math.random() * 10) + 1);
  const [userAnswer, setUserAnswer] = useState("");
  const [isVerificationValid, setIsVerificationValid] = useState(false);

  const correctAnswer = num1 + num2;

  const generateNewNumbers = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setUserAnswer("");
    setIsVerificationValid(false);
  };

  const handleVerificationChange = (value: string) => {
    setUserAnswer(value);
    const answer = parseInt(value);
    setIsVerificationValid(answer === correctAnswer);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerificationValid) {
      toast.error("Please solve the math problem correctly");
      return;
    }
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Handle specific authentication errors
        if (error.message.includes("Invalid login credentials") || 
            error.message.includes("invalid_credentials") ||
            error.message.includes("Email not confirmed")) {
          toast.error("Username or password is incorrect. Please check your credentials and try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account before signing in.");
        } else {
          toast.error(error.message || "An error occurred during sign in");
        }
        return;
      }

      if (data.user) {
        toast.success("Welcome back! Login successful");
        onLoginSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 p-4 relative overflow-hidden">
      {/* Enhanced animated background with particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-60 h-60 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rotate-45 animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-32 right-20 w-3 h-3 bg-blue-300/30 rounded-full animate-bounce animation-delay-3000"></div>
        <div className="absolute top-1/2 right-32 w-2 h-8 bg-indigo-300/20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-40 left-1/4 w-6 h-6 border border-white/20 rotate-12 animate-spin" style={{ animationDuration: '8s' }}></div>
      </div>

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Company Branding */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm shadow-2xl animate-scale-in border border-white/20">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent animate-fade-in">
              Nurse Assist International
            </h1>
            <p className="text-lg text-blue-100 font-semibold animate-fade-in animation-delay-200">(NAI)</p>
            <p className="text-blue-200/80 animate-fade-in animation-delay-400">Professional Healthcare Education Management</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-lg animate-fade-in animation-delay-600 border border-white/20">
          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-blue-100">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-300 focus:ring-blue-300/50 transition-all duration-200 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-blue-100">
                  Password
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-blue-200" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-300 focus:ring-blue-300/50 transition-all duration-200 backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-blue-200 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Number Verification */}
              <div className="space-y-2">
                <Label htmlFor="verification" className="text-sm font-medium text-blue-100">
                  Security Verification
                </Label>
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/20">
                  <div className="text-white text-lg font-semibold">
                    {num1} + {num2} = ?
                  </div>
                  <Input
                    id="verification"
                    type="number"
                    placeholder="Answer"
                    value={userAnswer}
                    onChange={(e) => handleVerificationChange(e.target.value)}
                    className="w-20 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-300 focus:ring-blue-300/50 transition-all duration-200 backdrop-blur-sm text-center"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateNewNumbers}
                    className="text-blue-200 hover:text-white transition-colors"
                    title="Generate new numbers"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  {userAnswer && (
                    <div className="text-sm">
                      {isVerificationValid ? (
                        <span className="text-green-300">✓</span>
                      ) : (
                        <span className="text-red-300">✗</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isVerificationValid}
                className="w-full h-12 bg-gradient-to-r from-blue-500/80 to-indigo-600/80 hover:from-blue-400/90 hover:to-indigo-500/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-blue-200">
                Secure admin access • All rights granted upon login
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in animation-delay-800">
          <p className="text-sm text-blue-200">
            Developed by{" "}
            <a 
              href="https://www.alltechzone.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-100 hover:underline transition-colors font-semibold"
            >
              Alltechzone
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
