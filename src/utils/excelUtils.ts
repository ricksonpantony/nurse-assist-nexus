
import * as XLSX from 'xlsx';
import { Student } from '@/hooks/useStudents';
import { Course } from '@/hooks/useCourses';

export interface StudentImportData {
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  country?: string;
  passport_id?: string;
  course_title?: string;
  join_date: string;
  class_start_date?: string;
  status: string;
  advance_payment?: number;
  installments?: number;
  // Payment stages
  advance_payment_amount?: number;
  advance_payment_mode?: string;
  advance_payment_date?: string;
  second_payment_amount?: number;
  second_payment_mode?: string;
  second_payment_date?: string;
  third_payment_amount?: number;
  third_payment_mode?: string;
  third_payment_date?: string;
  final_payment_amount?: number;
  final_payment_mode?: string;
  final_payment_date?: string;
}

export const generateSampleExcel = () => {
  const sampleData: StudentImportData[] = [
    {
      full_name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main Street, City",
      country: "United States",
      passport_id: "AB123456",
      course_title: "Web Development Bootcamp",
      join_date: "15-01-2024",
      class_start_date: "01-02-2024",
      status: "enrolled",
      advance_payment: 1000,
      installments: 4,
      advance_payment_amount: 1000,
      advance_payment_mode: "Credit Card",
      advance_payment_date: "15-01-2024",
      second_payment_amount: 1500,
      second_payment_mode: "Bank Transfer",
      second_payment_date: "15-02-2024"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  
  // Set column widths (removed total_course_fee column)
  const colWidths = [
    { wch: 20 }, // full_name
    { wch: 25 }, // email
    { wch: 15 }, // phone
    { wch: 30 }, // address
    { wch: 15 }, // country
    { wch: 12 }, // passport_id
    { wch: 25 }, // course_title
    { wch: 12 }, // join_date
    { wch: 15 }, // class_start_date
    { wch: 15 }, // status
    { wch: 15 }, // advance_payment
    { wch: 12 }, // installments
    { wch: 20 }, // advance_payment_amount
    { wch: 20 }, // advance_payment_mode
    { wch: 20 }, // advance_payment_date
    { wch: 20 }, // second_payment_amount
    { wch: 20 }, // second_payment_mode
    { wch: 20 }, // second_payment_date
    { wch: 20 }, // third_payment_amount
    { wch: 20 }, // third_payment_mode
    { wch: 20 }, // third_payment_date
    { wch: 20 }, // final_payment_amount
    { wch: 20 }, // final_payment_mode
    { wch: 20 }, // final_payment_date
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, "student_import_sample.xlsx");
};

export const exportStudentsToExcel = (students: Student[], courses: Course[]) => {
  const exportData = students.map(student => {
    const course = courses.find(c => c.id === student.course_id);
    return {
      student_id: student.id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      address: student.address || '',
      country: student.country || '',
      passport_id: student.passport_id || '',
      course_title: course?.title || 'No Course Assigned',
      join_date: formatDateForExcel(student.join_date),
      class_start_date: student.class_start_date ? formatDateForExcel(student.class_start_date) : '',
      status: student.status,
      total_course_fee: student.total_course_fee,
      advance_payment: student.advance_payment || 0,
      installments: student.installments || 1,
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  
  // Set column widths
  const colWidths = [
    { wch: 15 }, // student_id
    { wch: 20 }, // full_name
    { wch: 25 }, // email
    { wch: 15 }, // phone
    { wch: 30 }, // address
    { wch: 15 }, // country
    { wch: 12 }, // passport_id
    { wch: 25 }, // course_title
    { wch: 12 }, // join_date
    { wch: 15 }, // class_start_date
    { wch: 15 }, // status
    { wch: 15 }, // total_course_fee
    { wch: 15 }, // advance_payment
    { wch: 12 }, // installments
  ];
  ws['!cols'] = colWidths;

  const currentDate = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `students_export_${currentDate}.xlsx`);
};

export const parseExcelFile = (file: File): Promise<StudentImportData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as StudentImportData[];
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const formatDateForExcel = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseDateFromExcel = (dateString: string): string => {
  if (!dateString) return '';
  
  // Handle dd-mm-yyyy format
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Handle other formats or return as is
  return dateString;
};
