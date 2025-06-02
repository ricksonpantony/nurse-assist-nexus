import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit, Trash2, UserPlus, Search, Printer } from "lucide-react";
import { Lead } from "@/hooks/useLeads";
import { Course } from "@/hooks/useCourses";
import { countries } from "@/utils/countries";
import { format } from "date-fns";
import { LEAD_STATUS_OPTIONS, getLeadStatusColor } from "@/hooks/useLeads";

interface LeadsTableProps {
  leads: Lead[];
  courses: Course[];
  referrals: any[];
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onView: (lead: Lead) => void;
  onTransfer: (lead: Lead) => void;
  onPrint?: (selectedLeads: Lead[]) => void;
}

export const LeadsTable = ({ leads, courses, referrals, onEdit, onDelete, onView, onTransfer, onPrint }: LeadsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const filteredAndSortedLeads = leads
    .filter(lead => {
      const matchesSearch = searchTerm === "" || 
        lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.country && lead.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.lead_id && lead.lead_id.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCountry = countryFilter === "all" || lead.country === countryFilter;
      const matchesCourse = courseFilter === "all" || lead.interested_course_id === courseFilter;
      const matchesLeadStatus = leadStatusFilter === "all" || lead.lead_status === leadStatusFilter;
      
      return matchesSearch && matchesCountry && matchesCourse && matchesLeadStatus;
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
        case "lead_status":
          return (a.lead_status || "").localeCompare(b.lead_status || "");
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

  const handleRowClick = (lead: Lead, event: React.MouseEvent) => {
    // Don't navigate if user clicked on a button or checkbox
    if ((event.target as HTMLElement).closest('button') || (event.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    onView(lead);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredAndSortedLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handlePrint = () => {
    if (selectedLeads.length === 0) return;
    const selectedLeadData = filteredAndSortedLeads.filter(lead => selectedLeads.includes(lead.id));
    onPrint?.(selectedLeadData);
  };

  const isAllSelected = filteredAndSortedLeads.length > 0 && selectedLeads.length === filteredAndSortedLeads.length;
  const isPartiallySelected = selectedLeads.length > 0 && selectedLeads.length < filteredAndSortedLeads.length;

  return (
    <div className="space-y-6">
      {/* Modern Search and Filter Controls */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-white p-6 rounded-xl shadow-lg border border-blue-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
              <Input
                placeholder="Search by name, email, phone, country, or Lead ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 border-blue-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[200px] h-11 border-blue-200 bg-white/80 backdrop-blur-sm">
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
            <SelectTrigger className="w-[200px] h-11 border-blue-200 bg-white/80 backdrop-blur-sm">
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

          <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
            <SelectTrigger className="w-[200px] h-11 border-blue-200 bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {LEAD_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] h-11 border-blue-200 bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Added</SelectItem>
              <SelectItem value="country">Country (A-Z)</SelectItem>
              <SelectItem value="course">Interested Course</SelectItem>
              <SelectItem value="expected_date">Expected Joining Date</SelectItem>
              <SelectItem value="referral">Referral Status</SelectItem>
              <SelectItem value="lead_status">Lead Status</SelectItem>
            </SelectContent>
          </Select>

          {selectedLeads.length > 0 && (
            <Button
              onClick={handlePrint}
              className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Printer className="h-4 w-4" />
              Print Selected ({selectedLeads.length})
            </Button>
          )}
        </div>
      </div>

      {/* Modern Leads Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header with total count */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
          <div className="text-lg font-semibold text-blue-900">
            Total Leads: {filteredAndSortedLeads.length}
            {filteredAndSortedLeads.length !== leads.length && (
              <span className="text-sm text-blue-600 ml-2">
                (filtered from {leads.length})
              </span>
            )}
            {selectedLeads.length > 0 && (
              <span className="text-sm text-green-600 ml-2">
                • {selectedLeads.length} selected
              </span>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:bg-gradient-to-r hover:from-blue-700 hover:via-blue-800 hover:to-blue-900">
              <TableHead className="font-bold text-white text-sm w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                />
                {isPartiallySelected && (
                  <div className="text-xs text-blue-200 mt-1">Partial</div>
                )}
              </TableHead>
              <TableHead className="font-bold text-white text-sm w-[60px]">S.No</TableHead>
              <TableHead className="font-bold text-white text-sm">Lead ID</TableHead>
              <TableHead className="font-bold text-white text-sm">Name & Contact</TableHead>
              <TableHead className="font-bold text-white text-sm">Location</TableHead>
              <TableHead className="font-bold text-white text-sm">Course Interest</TableHead>
              <TableHead className="font-bold text-white text-sm">Lead Status</TableHead>
              <TableHead className="font-bold text-white text-sm">Expected Date</TableHead>
              <TableHead className="font-bold text-white text-sm">Referral</TableHead>
              <TableHead className="font-bold text-white text-sm">Date Added</TableHead>
              <TableHead className="font-bold text-white text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeads.map((lead, index) => {
              const course = getCourse(lead.interested_course_id || "");
              const referral = getReferral(lead.referral_id || "");
              const isConverted = lead.lead_status === 'Converted to Student';
              const isSelected = selectedLeads.includes(lead.id);
              
              return (
                <TableRow 
                  key={lead.id} 
                  className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } ${isConverted ? 'opacity-60' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={(e) => handleRowClick(lead, e)}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-center">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-xs">
                        {lead.lead_id || 'N/A'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">{lead.full_name}</div>
                      <div className="text-sm text-blue-600">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                      {lead.passport_id && (
                        <div className="text-xs text-gray-400">ID: {lead.passport_id}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        {lead.country || "Not specified"}
                      </Badge>
                      {lead.address && (
                        <div className="text-xs text-gray-500 max-w-[150px] truncate">
                          {lead.address}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {course ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {course.title}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">Not specified</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getLeadStatusColor(lead.lead_status || 'New')}>
                      {lead.lead_status || 'New'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {lead.expected_joining_date ? (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {format(new Date(lead.expected_joining_date), 'dd/MM/yyyy')}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">Not specified</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {referral ? (
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                        {referral.full_name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                        Direct
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(lead);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs gap-1"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                        Account View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(lead);
                        }}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
                        title="Edit Lead"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!isConverted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTransfer(lead);
                          }}
                          className="text-green-600 hover:text-green-800 hover:bg-green-100 transition-all duration-200"
                          title="Transfer to Student Account"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(lead.id);
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 transition-all duration-200"
                        title="Delete Lead"
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
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No leads found</div>
            <div className="text-gray-500 text-sm">
              Try adjusting your search criteria or add a new lead to get started.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
