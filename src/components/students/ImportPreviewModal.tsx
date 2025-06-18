
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Edit, Check, X, AlertCircle } from "lucide-react";
import { StudentImportData } from "@/utils/excelUtils";
import { Course } from "@/hooks/useCourses";

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  importData: StudentImportData[];
  courses: Course[];
  onConfirmImport: (data: StudentImportData[]) => void;
  onCancelImport: () => void;
}

export const ImportPreviewModal = ({ 
  isOpen, 
  onClose, 
  importData, 
  courses, 
  onConfirmImport, 
  onCancelImport 
}: ImportPreviewModalProps) => {
  const [editableData, setEditableData] = useState<StudentImportData[]>(importData);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: number]: string[]}>({});

  const statusOptions = [
    'Attended Online', 'Attend sessions', 'Attended F2F', 
    'Exam cycle', 'Awaiting results', 'Pass', 'Fail'
  ];

  const paymentModes = [
    'Credit Card', 'Bank Transfer', 'Cash', 'Cheque', 'Online Payment'
  ];

  const validateRow = (row: StudentImportData, index: number): string[] => {
    const errors: string[] = [];
    
    if (!row.full_name?.trim()) errors.push('Full name is required');
    if (!row.email?.trim()) errors.push('Email is required');
    if (!row.phone?.trim()) errors.push('Phone is required');
    if (!row.join_date?.trim()) errors.push('Join date is required');
    
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push('Invalid email format');
    }
    
    if (row.course_title && !courses.find(c => c.title.toLowerCase() === row.course_title?.toLowerCase())) {
      errors.push(`Course "${row.course_title}" not found`);
    }
    
    if (row.status && !statusOptions.includes(row.status)) {
      errors.push('Invalid status');
    }
    
    return errors;
  };

  const validateAllData = () => {
    const errors: {[key: number]: string[]} = {};
    editableData.forEach((row, index) => {
      const rowErrors = validateRow(row, index);
      if (rowErrors.length > 0) {
        errors[index] = rowErrors;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditRow = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveRow = (index: number) => {
    const errors = validateRow(editableData[index], index);
    if (errors.length === 0) {
      setEditingIndex(null);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    } else {
      setValidationErrors(prev => ({ ...prev, [index]: errors }));
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleFieldChange = (index: number, field: keyof StudentImportData, value: string | number) => {
    setEditableData(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleConfirmImport = () => {
    if (validateAllData()) {
      onConfirmImport(editableData);
    }
  };

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-blue-800 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Import Preview - Review & Edit Data
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Import Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-blue-600">Total Records</div>
                  <div className="text-2xl">{editableData.length}</div>
                </div>
                <div>
                  <div className="font-semibold text-red-600">Errors Found</div>
                  <div className="text-2xl">{Object.keys(validationErrors).length}</div>
                </div>
                <div>
                  <div className="font-semibold text-green-600">Ready to Import</div>
                  <div className="text-2xl">{editableData.length - Object.keys(validationErrors).length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {hasErrors && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Validation Errors Found:</strong> Please review and correct the highlighted errors before importing.
              </AlertDescription>
            </Alert>
          )}

          {/* Data Table */}
          <div className="flex-1">
            <Tabs defaultValue="basic" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="course">Course & Status</TabsTrigger>
                <TabsTrigger value="payments">Payment Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="flex-1">
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Edit</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.map((row, index) => (
                        <TableRow key={index} className={validationErrors[index] ? "bg-red-50" : ""}>
                          <TableCell>
                            {editingIndex === index ? (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleSaveRow(index)}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => handleEditRow(index)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Input
                                value={row.full_name}
                                onChange={(e) => handleFieldChange(index, 'full_name', e.target.value)}
                                className="w-full"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                {row.full_name}
                                {validationErrors[index]?.some(e => e.includes('Full name')) && (
                                  <Badge variant="destructive" className="text-xs">Error</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Input
                                value={row.email}
                                onChange={(e) => handleFieldChange(index, 'email', e.target.value)}
                                className="w-full"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                {row.email}
                                {validationErrors[index]?.some(e => e.includes('email')) && (
                                  <Badge variant="destructive" className="text-xs">Error</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Input
                                value={row.phone}
                                onChange={(e) => handleFieldChange(index, 'phone', e.target.value)}
                                className="w-full"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                {row.phone}
                                {validationErrors[index]?.some(e => e.includes('Phone')) && (
                                  <Badge variant="destructive" className="text-xs">Error</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Input
                                value={row.country || ''}
                                onChange={(e) => handleFieldChange(index, 'country', e.target.value)}
                                className="w-full"
                              />
                            ) : (
                              row.country || 'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Select
                                value={row.status}
                                onValueChange={(value) => handleFieldChange(index, 'status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                {row.status}
                                {validationErrors[index]?.some(e => e.includes('status')) && (
                                  <Badge variant="destructive" className="text-xs">Error</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="course" className="flex-1">
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Edit</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Class Start Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.map((row, index) => (
                        <TableRow key={index} className={validationErrors[index] ? "bg-red-50" : ""}>
                          <TableCell>
                            {editingIndex === index ? (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleSaveRow(index)}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => handleEditRow(index)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>{row.full_name}</TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Select
                                value={row.course_title || ''}
                                onValueChange={(value) => handleFieldChange(index, 'course_title', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                  {courses.map(course => (
                                    <SelectItem key={course.id} value={course.title}>{course.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                {row.course_title || 'N/A'}
                                {validationErrors[index]?.some(e => e.includes('Course')) && (
                                  <Badge variant="destructive" className="text-xs">Error</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Input
                                value={row.batch_id || ''}
                                onChange={(e) => handleFieldChange(index, 'batch_id', e.target.value)}
                                className="w-full"
                              />
                            ) : (
                              row.batch_id || 'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Input
                                value={row.join_date}
                                onChange={(e) => handleFieldChange(index, 'join_date', e.target.value)}
                                placeholder="DD/MM/YYYY"
                                className="w-full"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                {row.join_date}
                                {validationErrors[index]?.some(e => e.includes('Join date')) && (
                                  <Badge variant="destructive" className="text-xs">Error</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIndex === index ? (
                              <Input
                                value={row.class_start_date || ''}
                                onChange={(e) => handleFieldChange(index, 'class_start_date', e.target.value)}
                                placeholder="DD/MM/YYYY"
                                className="w-full"
                              />
                            ) : (
                              row.class_start_date || 'N/A'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="payments" className="flex-1">
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Total Fee</TableHead>
                        <TableHead>Advance</TableHead>
                        <TableHead>Second</TableHead>
                        <TableHead>Third</TableHead>
                        <TableHead>Final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.full_name}</TableCell>
                          <TableCell>${row.total_course_fee || 0}</TableCell>
                          <TableCell>
                            {row.advance_payment_amount ? `$${row.advance_payment_amount} (${row.advance_payment_mode})` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {row.second_payment_amount ? `$${row.second_payment_amount} (${row.second_payment_mode})` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {row.third_payment_amount ? `$${row.third_payment_amount} (${row.third_payment_mode})` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {row.final_payment_amount ? `$${row.final_payment_amount} (${row.final_payment_mode})` : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Error Details */}
          {hasErrors && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-red-800">Validation Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(validationErrors).map(([index, errors]) => (
                    <div key={index} className="text-sm">
                      <strong>Row {parseInt(index) + 1} ({editableData[parseInt(index)].full_name}):</strong>
                      <ul className="ml-4 list-disc text-red-600">
                        {errors.map((error, i) => <li key={i}>{error}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-4">
            <Button variant="outline" onClick={onCancelImport}>
              Cancel Import
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={hasErrors}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Import ({editableData.length - Object.keys(validationErrors).length} records)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
