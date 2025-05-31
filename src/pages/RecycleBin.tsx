
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, RotateCcw, Archive, Database, Clock } from "lucide-react";
import { useRecycleBin } from "@/hooks/useRecycleBin";
import { formatDateForExcel } from "@/utils/excelUtils";

const RecycleBin = () => {
  const { items, loading, restoreItem, permanentlyDelete } = useRecycleBin();

  const getTableDisplayName = (tableName: string) => {
    const displayNames: Record<string, string> = {
      students: 'Student',
      courses: 'Course',
      referrals: 'Referral',
      payments: 'Payment',
      leads: 'Lead'
    };
    return displayNames[tableName] || tableName;
  };

  const getRecordName = (item: any) => {
    const data = item.record_data;
    if (data.full_name) return data.full_name;
    if (data.title) return data.title;
    if (data.name) return data.name;
    return data.id || 'Unknown';
  };

  const handleRestore = async (item: any) => {
    if (window.confirm(`Are you sure you want to restore this ${getTableDisplayName(item.original_table).toLowerCase()}?`)) {
      await restoreItem(item);
    }
  };

  const handlePermanentDelete = async (itemId: string, recordName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${recordName}"? This action cannot be undone.`)) {
      await permanentlyDelete(itemId);
    }
  };

  // Calculate stats
  const totalItems = items.length;
  const itemsByType = items.reduce((acc, item) => {
    const type = getTableDisplayName(item.original_table);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <div className="text-lg text-red-600 font-medium">Loading recycle bin...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-white/80 backdrop-blur-lg px-6 shadow-sm">
        <SidebarTrigger className="text-red-600 hover:bg-red-100 rounded-lg transition-colors" />
        <div className="flex-1">
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-900 via-orange-800 to-yellow-800 bg-clip-text text-transparent">
            Recycle Bin
          </h1>
          <p className="text-sm text-red-600/80">Manage deleted records - last 50 entries</p>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white/70 backdrop-blur-sm border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Total Items</CardTitle>
              <Archive className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {totalItems}
              </div>
              <p className="text-xs text-red-600/70 mt-1">Deleted records</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Students</CardTitle>
              <Database className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                {itemsByType['Student'] || 0}
              </div>
              <p className="text-xs text-orange-600/70 mt-1">Deleted students</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Courses</CardTitle>
              <Database className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {itemsByType['Course'] || 0}
              </div>
              <p className="text-xs text-yellow-600/70 mt-1">Deleted courses</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-pink-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-800">Others</CardTitle>
              <Clock className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                {(itemsByType['Referral'] || 0) + (itemsByType['Payment'] || 0) + (itemsByType['Lead'] || 0)}
              </div>
              <p className="text-xs text-pink-600/70 mt-1">Other records</p>
            </CardContent>
          </Card>
        </div>

        {/* Recycle Bin Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-red-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-red-800 to-orange-800 bg-clip-text text-transparent">
              Deleted Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-50/50 border-b border-red-200/30">
                    <TableHead className="font-semibold text-red-900">Type</TableHead>
                    <TableHead className="font-semibold text-red-900">Name</TableHead>
                    <TableHead className="font-semibold text-red-900">Original Location</TableHead>
                    <TableHead className="font-semibold text-red-900">Date Deleted</TableHead>
                    <TableHead className="font-semibold text-red-900 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const recordName = getRecordName(item);
                    const tableDisplayName = getTableDisplayName(item.original_table);
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-red-50/30 transition-colors border-b border-red-100/30">
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="border-red-200 text-red-800 bg-red-50/50 hover:bg-red-100/50 transition-colors"
                          >
                            {tableDisplayName}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-800">{recordName}</TableCell>
                        <TableCell className="text-gray-600">{item.original_table}</TableCell>
                        <TableCell className="text-gray-600">{formatDateForExcel(item.deleted_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRestore(item)}
                              className="gap-1 text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handlePermanentDelete(item.id, recordName)}
                              className="text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {items.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center space-y-4">
                  <Trash2 className="h-16 w-16 text-gray-300" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Recycle bin is empty</h3>
                    <p className="text-gray-500">No deleted items found. All clean!</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RecycleBin;
