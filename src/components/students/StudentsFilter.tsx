
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, SortAsc, SortDesc, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StudentsFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  courseFilter: string;
  onCourseFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  batchFilter: string;
  onBatchFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  onPrintSelected: () => void;
  courses: any[];
  countries: string[];
  batches: string[];
  selectedStudentsCount: number;
}

export const StudentsFilter = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  courseFilter,
  onCourseFilterChange,
  countryFilter,
  onCountryFilterChange,
  batchFilter,
  onBatchFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  onPrintSelected,
  courses,
  countries,
  batches,
  selectedStudentsCount
}: StudentsFilterProps) => {
  const statusOptions = [
    'Attended Online',
    'Attend sessions', 
    'Attended F2F',
    'Exam cycle',
    'Awaiting results',
    'Pass',
    'Fail'
  ];

  const sortOptions = [
    { value: 'full_name', label: 'Name' },
    { value: 'join_date', label: 'Join Date' },
    { value: 'status', label: 'Status' },
    { value: 'total_course_fee', label: 'Course Fee' },
    { value: 'id', label: 'Student ID' },
    { value: 'country', label: 'Country' }
  ];

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || courseFilter !== 'all' || countryFilter !== 'all' || batchFilter !== 'all';

  return (
    <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar and Actions - Always Visible */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, phone, or student ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedStudentsCount > 0 && (
              <Button
                variant="outline"
                onClick={onPrintSelected}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Printer className="h-4 w-4" />
                Print Selected ({selectedStudentsCount})
              </Button>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters - Always Visible */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Course</label>
              <Select value={courseFilter} onValueChange={onCourseFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <Select value={countryFilter} onValueChange={onCountryFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Batch Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Batch</label>
              <Select value={batchFilter} onValueChange={onBatchFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map(batch => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort Order</label>
              <Button
                variant="outline"
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full justify-start"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Ascending
                  </>
                ) : (
                  <>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Descending
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
