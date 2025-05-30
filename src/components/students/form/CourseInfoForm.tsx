
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "@/hooks/useCourses";
import { Student } from "@/hooks/useStudents";

interface CourseInfoFormProps {
  formData: {
    course_id: string;
    batch_id: string;
    join_date: string;
    class_start_date: string;
    status: Student['status'];
  };
  courses: Course[];
  onFieldChange: (field: string, value: any) => void;
  isMobile: boolean;
}

export const CourseInfoForm = ({ formData, courses, onFieldChange, isMobile }: CourseInfoFormProps) => {
  return (
    <>
      <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        <div>
          <Label htmlFor="course_id">Course *</Label>
          <Select value={formData.course_id} onValueChange={(value) => onFieldChange("course_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="batch_id">Batch ID</Label>
          <Input
            id="batch_id"
            value={formData.batch_id}
            onChange={(e) => onFieldChange("batch_id", e.target.value)}
          />
        </div>
      </div>

      <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        <div>
          <Label htmlFor="join_date">Join Date *</Label>
          <Input
            id="join_date"
            type="date"
            value={formData.join_date}
            onChange={(e) => onFieldChange("join_date", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="class_start_date">Class Start Date</Label>
          <Input
            id="class_start_date"
            type="date"
            value={formData.class_start_date}
            onChange={(e) => onFieldChange("class_start_date", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value: Student['status']) => onFieldChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Attended Online">Attended Online</SelectItem>
            <SelectItem value="Attend sessions">Attend sessions</SelectItem>
            <SelectItem value="Attended F2F">Attended F2F</SelectItem>
            <SelectItem value="Exam cycle">Exam cycle</SelectItem>
            <SelectItem value="Awaiting results">Awaiting results</SelectItem>
            <SelectItem value="Pass">Pass</SelectItem>
            <SelectItem value="Fail">Fail</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
