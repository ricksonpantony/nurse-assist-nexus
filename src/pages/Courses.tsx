
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  GraduationCap,
  Star
} from "lucide-react";
import { CourseList } from "@/components/courses/CourseList";
import { CourseForm } from "@/components/courses/CourseForm";
import { CourseStats } from "@/components/courses/CourseStats";

const Courses = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
            <SidebarTrigger className="text-blue-600 hover:bg-blue-100 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Course Management</h1>
              <p className="text-sm text-blue-600">Manage all courses and training programs</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Course Statistics */}
            <CourseStats />

            {/* Search and Filter Bar */}
            <Card className="bg-gradient-to-r from-white to-blue-50 border-white/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-100 to-blue-200">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  All Courses
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  Active
                </TabsTrigger>
                <TabsTrigger value="draft" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  Draft
                </TabsTrigger>
                <TabsTrigger value="archived" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  Archived
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <CourseList searchTerm={searchTerm} status="all" />
              </TabsContent>
              
              <TabsContent value="active" className="space-y-4">
                <CourseList searchTerm={searchTerm} status="active" />
              </TabsContent>
              
              <TabsContent value="draft" className="space-y-4">
                <CourseList searchTerm={searchTerm} status="draft" />
              </TabsContent>
              
              <TabsContent value="archived" className="space-y-4">
                <CourseList searchTerm={searchTerm} status="archived" />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      {/* Course Creation Form Modal */}
      {showCreateForm && (
        <CourseForm 
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            setShowCreateForm(false);
            // Refresh course list
          }}
        />
      )}
    </SidebarProvider>
  );
};

export default Courses;
