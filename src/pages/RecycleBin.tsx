
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, RotateCcw } from "lucide-react";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Loading recycle bin...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-red-50 to-white px-6 shadow-lg backdrop-blur-sm">
        <SidebarTrigger className="text-red-600 hover:bg-red-100 rounded-lg" />
        <div className="flex-1">
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">Recycle Bin</h1>
          <p className="text-sm text-red-600">Manage deleted records - last 50 entries</p>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-red-50">
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
                    <TableRow key={item.id} className="hover:bg-red-50 transition-colors">
                      <TableCell>
                        <Badge variant="outline" className="border-red-200 text-red-800">
                          {tableDisplayName}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{recordName}</TableCell>
                      <TableCell className="text-gray-600">{item.original_table}</TableCell>
                      <TableCell>{formatDateForExcel(item.deleted_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRestore(item)}
                            className="gap-1 text-green-600 hover:bg-green-50 border-green-200"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handlePermanentDelete(item.id, recordName)}
                            className="text-red-600 hover:bg-red-50"
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
              <Trash2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No deleted items found. The recycle bin is empty.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecycleBin;
