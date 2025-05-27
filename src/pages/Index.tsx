
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, GraduationCap, TrendingUp, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nurse Assist Nexus</h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Admin Access
                  </Badge>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <LogoutButton />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Admin Dashboard
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Manage courses, students, and training programs with full administrative access
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <BookOpen className="w-6 h-6 mr-2" />
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100">Manage training programs</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-100">Track student progress</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-100">View performance metrics</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Link to="/courses">
                <BookOpen className="w-5 h-5 mr-2" />
                Manage Courses
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-blue-200 hover:bg-blue-50">
              <Link to="/students">
                <Users className="w-5 h-5 mr-2" />
                Manage Students
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Schedule Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize class schedules, set course dates, and manage student enrollments efficiently.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                Student Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor student progress, manage enrollments, and track payment statuses in real-time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                Multi-Location Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage students from different countries and handle international training programs.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
