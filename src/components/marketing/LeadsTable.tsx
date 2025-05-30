
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, Trash2, UserPlus, Search } from "lucide-react";
import { Lead } from "@/hooks/useLeads";
import { Course } from "@/hooks/useCourses";
import { countries } from "@/utils/countries";
import { format } from "date-fns";

interface LeadsTableProps {
  leads: Lead[];
  courses: Course[];
  referrals: any[];
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onView: (lead: Lead) => void;
  onTransfer: (lead: Lead) => void;
}

export const LeadsTable = ({ leads, courses, referrals, onEdit, onDelete, onView, onTransfer }: LeadsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  const filteredAndSortedLeads = leads
    .filter(lead => {
      const matchesSearch = searchTerm === "" || 
        lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.country && lead.country.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCountry = countryFilter === "all" || lead.country === countryFilter;
      const matchesCourse = courseFilter === "all" || lead.interested_course_id === courseFilter;
      
      return matchesSearch && matchesCountry && matchesCourse;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "country":
          return (a.country || "").localeCompare(b.country || "");
        case "course":
          const courseA = courses.find(c => c.id === a.interested_course_id)?.title || "";
          const courseB = courses.find(c => c.id === b.interested_course_id)?.title || "";
          return courseA.localeCompare(courseB);
        case "expected_date":
          return new Date(a.expected_joining_date || 0).getTime() - new Date(b.expected_joining_date || 0).getTime();
        case "referral":
          const referralA = referrals.find(r => r.id === a.referral_id)?.full_name || "";
          const referralB = referrals.find(r => r.id === b.referral_id)?.full_name || "";
          return referralA.localeCompare(referralB);
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const getReferral = (referralId: string) => {
    return referrals.find(r => r.id === referralId);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, phone, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date Added</SelectItem>
            <SelectItem value="country">Country (A-Z)</SelectItem>
            <SelectItem value="course">Interested Course</SelectItem>
            <SelectItem value="expected_date">Expected Joining Date</SelectItem>
            <SelectItem value="referral">Referral Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100">
              <TableHead className="font-semibold text-blue-900">Name</TableHead>
              <TableHead className="font-semibold text-blue-900">Contact</TableHead>
              <TableHead className="font-semibold text-blue-900">Country</TableHead>
              <TableHead className="font-semibold text-blue-900">Interested Course</TableHead>
              <TableHead className="font-semibold text-blue-900">Expected Date</TableHead>
              <TableHead className="font-semibold text-blue-900">Referral</TableHead>
              <TableHead className="font-semibold text-blue-900">Date Added</TableHead>
              <TableHead className="font-semibold text-blue-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeads.map((lead) => {
              const course = getCourse(lead.interested_course_id || "");
              const referral = getReferral(lead.referral_id || "");
              
              return (
                <TableRow key={lead.id} className="hover:bg-blue-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{lead.full_name}</div>
                      <div className="text-sm text-gray-500">{lead.passport_id || "No ID"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.country || "Not specified"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {course ? course.title : "Not specified"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.expected_joining_date ? 
                      format(new Date(lead.expected_joining_date), 'dd/MM/yyyy') : 
                      "Not specified"
                    }
                  </TableCell>
                  <TableCell>
                    {referral ? (
                      <Badge variant="secondary">{referral.full_name}</Badge>
                    ) : (
                      <Badge variant="outline">Direct</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(lead)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(lead)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTransfer(lead)}
                        className="text-green-600 hover:text-green-800"
                        title="Transfer to Student Account"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(lead.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredAndSortedLeads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No leads found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
