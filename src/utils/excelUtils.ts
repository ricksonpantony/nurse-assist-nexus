
import * as XLSX from 'xlsx';
import { Student } from '@/hooks/useStudents';
import { Course } from '@/hooks/useCourses';

export interface StudentImportData {
  // Basic Information
  full_name: string;
  email: string;
  phone: string | number;
  address?: string;
  country?: string;
  passport_id?: string;
  
  // Course Information
  course_title?: string;
  batch_id?: string;
  join_date: string;
  class_start_date?: string;
  status: string;
  
  // Referral Information
  referred_by_name?: string;
  referral_payment_amount?: number;
  
  // Payment Information
  total_course_fee?: number;
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
  
  // Notes
  notes?: string;
}

export const generateSampleExcel = (courses: Course[] = []) => {
  // Generate unique sample emails to avoid conflicts
  const timestamp = Date.now();
  const sampleData: StudentImportData[] = [
    {
      full_name: "John Doe (SAMPLE - DELETE THIS ROW)",
      email: `sample.john.doe.${timestamp}@example.com`,
      phone: "+1234567890",
      address: "123 Main Street, City",
      country: "United States",
      passport_id: "AB123456",
      course_title: courses.length > 0 ? courses[0].title : "Web Development Bootcamp",
      batch_id: "BATCH-2024-001",
      join_date: "15/01/2024",
      class_start_date: "01/02/2024",
      status: "Attended Online",
      referred_by_name: "Jane Smith",
      referral_payment_amount: 500,
      total_course_fee: courses.length > 0 ? courses[0].fee : 5000,
      advance_payment_amount: 1000,
      advance_payment_mode: "Credit Card",
      advance_payment_date: "15/01/2024",
      second_payment_amount: 1500,
      second_payment_mode: "Bank Transfer",
      second_payment_date: "15/02/2024",
      third_payment_amount: 1000,
      third_payment_mode: "Credit Card",
      third_payment_date: "15/03/2024",
      final_payment_amount: 1500,
      final_payment_mode: "Bank Transfer",
      final_payment_date: "15/04/2024",
      notes: "Student prefers online sessions"
    },
    {
      full_name: "Alice Johnson (SAMPLE - DELETE THIS ROW)",
      email: `sample.alice.johnson.${timestamp + 1}@example.com`,
      phone: "+1234567892",
      address: "789 Pine Street, City",
      country: "Canada",
      passport_id: "CD789012",
      course_title: courses.length > 1 ? courses[1].title : "Data Science Program",
      batch_id: "BATCH-2024-002",
      join_date: "20/01/2024",
      class_start_date: "05/02/2024",
      status: "Attend sessions",
      referred_by_name: "", // Direct referral
      referral_payment_amount: 0,
      total_course_fee: courses.length > 1 ? courses[1].fee : 7000,
      advance_payment_amount: 2000,
      advance_payment_mode: "Bank Transfer",
      advance_payment_date: "20/01/2024",
      second_payment_amount: 2500,
      second_payment_mode: "Credit Card",
      second_payment_date: "20/02/2024",
      third_payment_amount: 1500,
      third_payment_mode: "Bank Transfer",
      third_payment_date: "20/03/2024",
      final_payment_amount: 1000,
      final_payment_mode: "Credit Card",
      final_payment_date: "20/04/2024",
      notes: "Needs flexible schedule"
    },
    {
      full_name: "Bob Wilson (SAMPLE - DELETE THIS ROW)",
      email: `sample.bob.wilson.${timestamp + 2}@example.com`,
      phone: "+1234567893",
      address: "321 Elm Street, City",
      country: "Australia",
      passport_id: "EF345678",
      course_title: courses.length > 2 ? courses[2].title : "Cybersecurity Course",
      batch_id: "BATCH-2024-003",
      join_date: "25/01/2024",
      class_start_date: "10/02/2024",
      status: "Pass",
      referred_by_name: "Mike Brown",
      referral_payment_amount: 300,
      total_course_fee: courses.length > 2 ? courses[2].fee : 4500,
      advance_payment_amount: 1500,
      advance_payment_mode: "Cash",
      advance_payment_date: "25/01/2024",
      second_payment_amount: 1500,
      second_payment_mode: "Bank Transfer",
      second_payment_date: "25/02/2024",
      final_payment_amount: 1500,
      final_payment_mode: "Credit Card",
      final_payment_date: "25/03/2024",
      notes: "Previous IT experience"
    }
  ];

  // Create the main worksheet
  const ws = XLSX.utils.json_to_sheet(sampleData);
  
  // Add course information as a separate sheet
  const courseInfo = courses.map(course => ({
    Course_ID: course.id,
    Course_Title: course.title,
    Description: course.description || '',
    Fee: course.fee,
    Duration_Months: course.period_months
  }));
  
  const courseSheet = XLSX.utils.json_to_sheet(courseInfo);
  
  // Batch examples sheet
  const batchExamples = [
    { Batch_ID_Examples: 'BATCH-2024-001' },
    { Batch_ID_Examples: 'BATCH-2024-002' },
    { Batch_ID_Examples: 'BATCH-2024-003' },
    { Batch_ID_Examples: 'WEB-DEV-JAN-2024' },
    { Batch_ID_Examples: 'DATA-SCI-FEB-2024' },
    { Batch_ID_Examples: 'CYBER-SEC-MAR-2024' }
  ];
  const batchSheet = XLSX.utils.json_to_sheet(batchExamples);
  
  // Status options sheet
  const statusOptions = [
    { Status_Options: 'Attended Online' },
    { Status_Options: 'Attend sessions' },
    { Status_Options: 'Attended F2F' },
    { Status_Options: 'Exam cycle' },
    { Status_Options: 'Awaiting results' },
    { Status_Options: 'Pass' },
    { Status_Options: 'Fail' }
  ];
  const statusSheet = XLSX.utils.json_to_sheet(statusOptions);
  
  // Payment modes sheet
  const paymentModes = [
    { Payment_Modes: 'Credit Card' },
    { Payment_Modes: 'Bank Transfer' },
    { Payment_Modes: 'Cash' },
    { Payment_Modes: 'Cheque' },
    { Payment_Modes: 'Online Payment' }
  ];
  const paymentSheet = XLSX.utils.json_to_sheet(paymentModes);

  // Create workbook and add sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Student_Import");
  XLSX.utils.book_append_sheet(wb, courseSheet, "Available_Courses");
  XLSX.utils.book_append_sheet(wb, batchSheet, "Batch_Examples");
  XLSX.utils.book_append_sheet(wb, statusSheet, "Status_Options");
  XLSX.utils.book_append_sheet(wb, paymentSheet, "Payment_Modes");
  
  // Set column widths for better readability (updated for new payment column)
  const colWidths = [
    { wch: 30 }, // full_name
    { wch: 30 }, // email
    { wch: 15 }, // phone
    { wch: 30 }, // address
    { wch: 15 }, // country
    { wch: 12 }, // passport_id
    { wch: 25 }, // course_title
    { wch: 18 }, // batch_id
    { wch: 12 }, // join_date
    { wch: 15 }, // class_start_date
    { wch: 20 }, // status
    { wch: 20 }, // referred_by_name
    { wch: 20 }, // referral_payment_amount
    { wch: 18 }, // total_course_fee
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
    { wch: 30 }, // notes
  ];
  ws['!cols'] = colWidths;

  // Set column widths for other sheets
  courseSheet['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 40 }, { wch: 10 }, { wch: 15 }
  ];
  batchSheet['!cols'] = [{ wch: 25 }];
  statusSheet['!cols'] = [{ wch: 20 }];
  paymentSheet['!cols'] = [{ wch: 20 }];

  XLSX.writeFile(wb, "student_import_template.xlsx");
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
      notes: student.notes || '',
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
    { wch: 30 }, // notes
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
        
        // Filter out sample data by checking for the sample identifier in the name
        const filteredData = jsonData.filter(row => 
          !row.full_name?.includes('(SAMPLE - DELETE THIS ROW)')
        );
        
        resolve(filteredData);
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
  return `${day}/${month}/${year}`;
};

export const parseDateFromExcel = (dateString: string): string => {
  if (!dateString) return '';
  
  // Handle dd/mm/yyyy format (preferred)
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Handle dd-mm-yyyy format (fallback)
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
