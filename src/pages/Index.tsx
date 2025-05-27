// Update this page (the content is just a fallback if you fail to update the page)

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, DollarSign, TrendingUp, BookOpen, Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2 } from 'lucide-react';

// Mock data for demonstration
const mockStudents = [
  {
    id: 'ATZ-2025-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    course: 'Nursing Foundation',
    joinDate: '2024-01-15',
    status: 'Enrolled',
    totalFee: 5000,
    paidAmount: 2000
  },
  {
    id: 'ATZ-2025-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1234567891',
    course: 'Advanced Care',
    joinDate: '2024-02-20',
    status: 'Online',
    totalFee: 7500,
    paidAmount: 7500
  },
  {
    id: 'ATZ-2025-003',
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '+1234567892',
    course: 'Critical Care',
    joinDate: '2024-03-10',
    status: 'Face to Face',
    totalFee: 6000,
    paidAmount: 3000
  }
];

const mockCourses = [
  { name: 'Nursing Foundation', description: 'Basic nursing principles and practices', fee: 5000, duration: '6 months' },
  { name: 'Advanced Care', description: 'Advanced patient care techniques', fee: 7500, duration: '12 months' },
  { name: 'Critical Care', description: 'Intensive care unit training', fee: 6000, duration: '9 months' }
];

const monthlyFeeData = [
  { month: 'Jan', amount: 15000 },
  { month: 'Feb', amount: 22000 },
  { month: 'Mar', amount: 18000 },
  { month: 'Apr', amount: 25000 },
  { month: 'May', amount: 20000 }
];

const statusData = [
  { name: 'Enrolled', value: 45, color: '#2563EB' },
  { name: 'Online', value: 30, color: '#1E40AF' },
  { name: 'Face to Face', value: 25, color: '#3B82F6' }
];

const courseStudentData = [
  { course: 'Nursing Foundation', students: 45 },
  { course: 'Advanced Care', students: 30 },
  { course: 'Critical Care', students: 25 }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  // Calculate KPIs
  const totalStudents = mockStudents.length;
  const totalFeeCollected = mockStudents.reduce((sum, student) => sum + student.paidAmount, 0);
  const outstandingBalance = mockStudents.reduce((sum, student) => sum + (student.totalFee - student.paidAmount), 0);

  // Filter students
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || student.course === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-900">NAI</h1>
                <p className="text-xs text-blue-600">Nurse Assist International</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Admin Portal
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-sm border border-blue-200">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Students</TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Courses</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Payments</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Reports</TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Audit Logs</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalStudents}</div>
                  <p className="text-blue-100 text-xs">Active enrollments</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fee Collected</CardTitle>
                  <DollarSign className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${totalFeeCollected.toLocaleString()}</div>
                  <p className="text-green-100 text-xs">Total payments received</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                  <TrendingUp className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${outstandingBalance.toLocaleString()}</div>
                  <p className="text-orange-100 text-xs">Pending payments</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <BookOpen className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{mockCourses.length}</div>
                  <p className="text-purple-100 text-xs">Available programs</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Monthly Fee Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyFeeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="month" stroke="#1e40af" />
                      <YAxis stroke="#1e40af" />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Student Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Students per Course</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={courseStudentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="course" stroke="#1e40af" />
                    <YAxis stroke="#1e40af" />
                    <Tooltip />
                    <Bar dataKey="students" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-blue-900">Student Management</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                    <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 border-blue-200">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Enrolled">Enrolled</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Face to Face">Face to Face</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger className="w-full sm:w-48 border-blue-200">
                      <SelectValue placeholder="Filter by Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {mockCourses.map(course => (
                        <SelectItem key={course.name} value={course.name}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Students Table */}
                <div className="rounded-lg border border-blue-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-blue-50">
                      <TableRow>
                        <TableHead className="text-blue-900 font-semibold">ID</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Name</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Email</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Phone</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Course</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Join Date</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Status</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="hover:bg-blue-50">
                          <TableCell className="font-medium text-blue-800">{student.id}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="text-gray-600">{student.email}</TableCell>
                          <TableCell className="text-gray-600">{student.phone}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {student.course}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">{student.joinDate}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                student.status === 'Enrolled' ? 'bg-green-50 text-green-700 border-green-200' :
                                student.status === 'Online' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-purple-50 text-purple-700 border-purple-200'
                              }
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-900">Course Management</CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-blue-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-blue-50">
                      <TableRow>
                        <TableHead className="text-blue-900 font-semibold">Course Name</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Description</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Fee</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Duration</TableHead>
                        <TableHead className="text-blue-900 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCourses.map((course) => (
                        <TableRow key={course.name} className="hover:bg-blue-50">
                          <TableCell className="font-medium text-blue-800">{course.name}</TableCell>
                          <TableCell className="text-gray-600">{course.description}</TableCell>
                          <TableCell className="font-medium">${course.fee.toLocaleString()}</TableCell>
                          <TableCell className="text-gray-600">{course.duration}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs content placeholders */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Payment Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Payment management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Comprehensive reporting dashboard will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">System audit trail will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Application settings and configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
