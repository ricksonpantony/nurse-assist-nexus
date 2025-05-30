
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";
import { useStudents, Student, Payment } from "@/hooks/useStudents";
import * as XLSX from "xlsx";

export const PaymentReports = () => {
  const { students } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<(Payment & { student: Student })[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("all");
  const [filteredPayments, setFilteredPayments] = useState<(Payment & { student: Student })[]>([]);
  const [monthFilter, setMonthFilter] = useState("all");

  const fetchAllPayments = async () => {
    setLoading(true);
    try {
      const allPayments: (Payment & { student: Student })[] = [];

      for (const student of students) {
        const studentPayments = await fetch(`https://jjcpsitegufprrynyisr.supabase.co/rest/v1/payments?student_id=eq.${student.id}&order=payment_date.desc`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqY3BzaXRlZ3VmcHJyeW55aXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTAyMTYsImV4cCI6MjA2MzkyNjIxNn0.lvPSKMUQAbL_WE1T7xj2Of4KXf4XapO_3rw6lJDrt2Q',
            'Content-Type': 'application/json'
          }
        }).then(res => res.json());

        // Add student information to each payment
        studentPayments.forEach((payment: Payment) => {
          allPayments.push({
            ...payment,
            student: student
          });
        });
      }

      setPayments(allPayments);
      setFilteredPayments(allPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (students.length > 0) {
      fetchAllPayments();
    }
  }, [students]);

  useEffect(() => {
    let filtered = [...payments];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.student.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by country
    if (countryFilter !== "all") {
      filtered = filtered.filter((payment) => payment.student.country === countryFilter);
    }

    // Filter by month
    if (monthFilter !== "all") {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate.getMonth() === parseInt(monthFilter);
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, countryFilter, monthFilter]);

  const exportToExcel = () => {
    // Prepare data for export
    const dataToExport = filteredPayments.map((payment) => ({
      "Payment ID": payment.id,
      "Student ID": payment.student_id,
      "Student Name": payment.student.full_name,
      "Country": payment.student.country || "N/A",
      "Payment Date": payment.payment_date,
      "Amount": payment.amount,
      "Payment Stage": payment.stage,
      "Payment Mode": payment.payment_mode,
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    
    // Generate Excel file
    XLSX.writeFile(wb, "payment_reports.xlsx");
  };

  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Reports</CardTitle>
        <CardDescription>
          Financial reports for all student payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {Array.from(new Set(payments.map(p => p.student.country).filter(Boolean))).sort().map((country) => (
                  <SelectItem key={country} value={country as string}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportToExcel} variant="outline" className="hidden md:flex">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
          <Button onClick={exportToExcel} variant="outline" className="w-full md:hidden">
            <Download className="h-4 w-4 mr-2" /> Export to Excel
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>Loading payment data...</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.student.full_name}</div>
                        <div className="text-xs text-gray-500">{payment.student_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{payment.student.country || "N/A"}</TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.stage}</TableCell>
                    <TableCell>{payment.payment_mode}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No payments found matching the criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Summary */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Summary</h3>
            <span className="font-bold text-lg">
              Total: ${filteredPayments.reduce((sum, payment) => sum + Number(payment.amount), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
