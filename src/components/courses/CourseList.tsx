
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign,
  Star,
  BookOpen
} from "lucide-react";

interface CourseListProps {
  searchTerm: string;
  status: string;
}

export const CourseList = ({ searchTerm, status }: CourseListProps) => {
  // Mock course data
  const courses = [
    {
      id: 1,
      title: "Advanced Nursing Fundamentals",
      description: "Comprehensive course covering advanced nursing techniques and patient care",
      instructor: "Dr. Sarah Johnson",
      students: 125,
      duration: "12 weeks",
      price: "$2,500",
      rating: 4.8,
      status: "active",
      startDate: "2024-02-01",
      category: "Nursing",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Emergency Care & First Aid",
      description: "Essential emergency response skills for healthcare professionals",
      instructor: "Dr. Michael Chen",
      students: 98,
      duration: "8 weeks",
      price: "$1,800",
      rating: 4.9,
      status: "active",
      startDate: "2024-01-15",
      category: "Emergency Care",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Pediatric Nursing Specialization",
      description: "Specialized training for pediatric patient care and treatment",
      instructor: "Dr. Emily Rodriguez",
      students: 76,
      duration: "10 weeks",
      price: "$2,200",
      rating: 4.7,
      status: "active",
      startDate: "2024-03-01",
      category: "Pediatrics",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Mental Health Nursing",
      description: "Understanding and treating mental health conditions in healthcare settings",
      instructor: "Dr. James Wilson",
      students: 54,
      duration: "14 weeks",
      price: "$2,800",
      rating: 4.6,
      status: "draft",
      startDate: "2024-04-01",
      category: "Mental Health",
      image: "/placeholder.svg"
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = status === "all" || course.status === status;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredCourses.map((course) => (
        <Card key={course.id} className="bg-gradient-to-br from-white to-slate-50 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(course.status)}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {course.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-slate-600 text-sm">
                  {course.description}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Course Image Placeholder */}
            <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {course.instructor.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <span className="text-sm text-slate-700 font-medium">{course.instructor}</span>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-1 text-slate-600">
                <Users className="h-4 w-4" />
                <span>{course.students} students</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <DollarSign className="h-4 w-4" />
                <span>{course.price}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating}</span>
              </div>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>Starts: {new Date(course.startDate).toLocaleDateString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
