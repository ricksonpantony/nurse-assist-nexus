
import * as XLSX from 'xlsx';
import { Student } from '@/hooks/useStudents';
import { Course } from '@/hooks/useCourses';

export interface StudentImportData {
  // Basic Information
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  country?: string;
  passport_id?: string;
  
  // Course Information
  course_title?: string;
  join_date: string;
  class_start_date?: string;
  status: string;
  
  // Referral Information
  referred_by_name?: string;
  referral_email?: string;
  referral_phone?: string;
  referral_address?: string;
  referral_bank_name?: string;
  referral_account_number?: string;
  referral_bsb?: string;
  referral_payment_amount?: number;
  
  // Payment Information
  total_course_fee?: number;
  advance_payment?: number;
  installments?: number;
  
  // Payment Stages
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
  
  // Internal fields for sample data recognition
  sample_id?: string;
}

export const generateSampleExcel = () => {
  const sampleData: StudentImportData[] = [
    {
      full_name: "John Doe (SAMPLE - DO NOT EDIT)",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main Street, City",
      country: "United States",
      passport_id: "AB123456",
      course_title: "Web Development Bootcamp",
      join_date: "15-01-2024",
      class_start_date: "01-02-2024",
      status: "Attended Online",
      referred_by_name: "Jane Smith",
      referral_email: "jane.smith@example.com",
      referral_phone: "+1234567891",
      referral_address: "456 Oak Street, City",
      referral_bank_name: "Sample Bank",
      referral_account_number: "123456789",
      referral_bsb: "123-456",
      referral_payment_amount: 500,
      total_course_fee: 5000,
      advance_payment: 1000,
      installments: 4,
      advance_payment_amount: 1000,
      advance_payment_mode: "Credit Card",
      advance_payment_date: "15-01-2024",
      second_payment_amount: 1500,
      second_payment_mode: "Bank Transfer",
      second_payment_date: "15-02-2024",
      third_payment_amount: 1500,
      third_payment_mode: "Cash",
      third_payment_date: "15-03-2024",
      final_payment_amount: 1000,
      final_payment_mode: "Credit Card",
      final_payment_date: "15-04-2024",
      sample_id: "SAMPLE_001"
    },
    {
      full_name: "Alice Johnson (SAMPLE - DO NOT EDIT)",
      email: "alice.johnson@example.com",
      phone: "+1234567892",
      address: "789 Pine Street, City",
      country: "Canada",
      passport_id: "CD789012",
      course_title: "Data Science Program",
      join_date: "20-01-2024",
      class_start_date: "05-02-2024",
      status: "Attend sessions",
      referred_by_name: "", // Direct referral
      referral_email: "",
      referral_phone: "",
      referral_address: "",
      referral_bank_name: "",
      referral_account_number: "",
      referral_bsb: "",
      referral_payment_amount: 0,
      total_course_fee: 7000,
      advance_payment: 2000,
      installments: 3,
      advance_payment_amount: 2000,
      advance_payment_mode: "Bank Transfer",
      advance_payment_date: "20-01-2024",
      second_payment_amount: 2500,
      second_payment_mode: "Credit Card",
      second_payment_date: "20-02-2024",
      final_payment_amount: 2500,
      final_payment_mode: "Bank Transfer",
      final_payment_date: "20-03-2024",
      sample_id: "SAMPLE_002"
    },
    {
      full_name: "Bob Wilson (SAMPLE - DO NOT EDIT)",
      email: "bob.wilson@example.com",
      phone: "+1234567893",
      address: "321 Elm Street, City",
      country: "Australia",
      passport_id: "EF345678",
      course_title: "Cybersecurity Course",
      join_date: "25-01-2024",
      class_start_date: "10-02-2024",
      status: "Pass",
      referred_by_name: "Mike Brown",
      referral_email: "mike.brown@example.com",
      referral_phone: "+1234567894",
      referral_address: "654 Maple Street, City",
      referral_bank_name: "Tech Bank",
      referral_account_number: "987654321",
      referral_bsb: "987-654",
      referral_payment_amount: 300,
      total_course_fee: 4500,
      advance_payment: 1500,
      installments: 2,
      advance_payment_amount: 1500,
      advance_payment_mode: "Cash",
      advance_payment_date: "25-01-2024",
      final_payment_amount: 3000,
      final_payment_mode: "Bank Transfer",
      final_payment_date: "25-02-2024",
      sample_id: "SAMPLE_003"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  
  // Set column widths for better readability
  const colWidths = [
    { wch: 25 }, // full_name
    { wch: 25 }, // email
    { wch: 15 }, // phone
    { wch: 30 }, // address
    { wch: 15 }, // country
    { wch: 12 }, // passport_id
    { wch: 25 }, // course_title
    { wch: 12 }, // join_date
    { wch: 15 }, // class_start_date
    { wch: 20 }, // status
    { wch: 20 }, // referred_by_name
    { wch: 25 }, // referral_email
    { wch: 15 }, // referral_phone
    { wch: 30 }, // referral_address
    { wch: 20 }, // referral_bank_name
    { wch: 20 }, // referral_account_number
    { wch: 15 }, // referral_bsb
    { wch: 20 }, // referral_payment_amount
    { wch: 18 }, // total_course_fee
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
    { wch: 15 }, // sample_id
  ];
  ws['!cols'] = colWidths;

  // Lock the sample rows (first 3 rows after header)
  if (!ws['!protect']) ws['!protect'] = {};
  ws['!protect'].selectLockedCells = false;
  ws['!protect'].selectUnlockedCells = true;
  
  // Mark sample rows as locked
  for (let row = 2; row <= 4; row++) { // Rows 2-4 (after header)
    for (let col = 0; col < Object.keys(sampleData[0]).length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col });
      if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
      if (!ws[cellRef].s) ws[cellRef].s = {};
      ws[cellRef].s.protection = { locked: true };
    }
  }

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
        
        // Filter out sample data
        const filteredData = jsonData.filter(row => 
          !row.sample_id || 
          !row.sample_id.startsWith('SAMPLE_') ||
          !row.full_name?.includes('(SAMPLE - DO NOT EDIT)')
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
