
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Eye, 
  Filter, 
  Download, 
  Clock,
  User,
  Database,
  Key,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState(25);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    user: 'all',
    action: 'all',
    table: 'all',
    severity: 'all',
  });

  // Enhanced mock data with actual database operations
  const mockAuditData: AuditLogEntry[] = [
    {
      id: '1',
      user_id: 'user1',
      user_email: 'admin@example.com',
      action: 'INSERT',
      table_name: 'students',
      record_id: 'ATZ-2024-001',
      old_values: null,
      new_values: { 
        full_name: 'John Doe', 
        email: 'john@example.com', 
        status: 'Attend sessions',
        total_course_fee: 3000,
        advance_payment: 1500
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'medium'
    },
    {
      id: '2',
      user_id: 'user1',
      user_email: 'admin@example.com',
      action: 'UPDATE',
      table_name: 'students',
      record_id: 'ATZ-2024-001',
      old_values: { 
        status: 'Attend sessions',
        total_course_fee: 3000
      },
      new_values: { 
        status: 'Attended F2F',
        total_course_fee: 3500
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'low'
    },
    {
      id: '3',
      user_id: 'user2',
      user_email: 'manager@example.com',
      action: 'INSERT',
      table_name: 'payments',
      record_id: 'PAY-001',
      old_values: null,
      new_values: { 
        student_id: 'ATZ-2024-001', 
        amount: 1500, 
        stage: 'Advance',
        payment_mode: 'Credit Card'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      severity: 'high'
    },
    {
      id: '4',
      user_id: 'user3',
      user_email: 'teacher@example.com',
      action: 'DELETE',
      table_name: 'students',
      record_id: 'ATZ-2024-002',
      old_values: { 
        full_name: 'Jane Smith', 
        email: 'jane@example.com', 
        status: 'Pass',
        total_course_fee: 2800,
        advance_payment: 1000
      },
      new_values: null,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      severity: 'critical'
    },
    {
      id: '5',
      user_id: 'user1',
      user_email: 'admin@example.com',
      action: 'PASSWORD_CHANGE',
      table_name: 'auth.users',
      record_id: 'user1',
      old_values: { password_hash: '***' },
      new_values: { password_hash: '***', password_changed_at: new Date().toISOString() },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'high'
    },
    {
      id: '6',
      user_id: 'user2',
      user_email: 'manager@example.com',
      action: 'UPDATE',
      table_name: 'payments',
      record_id: 'PAY-002',
      old_values: { 
        amount: 2000,
        stage: 'Second'
      },
      new_values: { 
        amount: 2500,
        stage: 'Final'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      severity: 'medium'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAuditLogs(mockAuditData);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = useMemo(() => {
    let filtered = [...auditLogs];

    if (filters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateTo)
      );
    }
    if (filters.user !== 'all') {
      filtered = filtered.filter(log => log.user_email === filters.user);
    }
    if (filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    if (filters.table !== 'all') {
      filtered = filtered.filter(log => log.table_name === filters.table);
    }
    if (filters.severity !== 'all') {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return filtered.slice(0, showCount);
  }, [auditLogs, filters, showCount]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      'critical': 'bg-red-50 text-red-700 border-red-200',
      'high': 'bg-orange-50 text-orange-700 border-orange-200',
      'medium': 'bg-blue-50 text-blue-700 border-blue-200',
      'low': 'bg-green-50 text-green-700 border-green-200'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'PASSWORD_CHANGE':
        return <Key className="h-4 w-4 text-purple-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const renderValueComparison = (oldVal: any, newVal: any, key: string) => {
    const isAmountField = key.toLowerCase().includes('amount') || key.toLowerCase().includes('fee');
    const isDelete = newVal === null;
    
    if (oldVal === null && newVal !== null) {
      // New value added
      return (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600">{key}:</div>
          <div className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
            + {typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)}
          </div>
        </div>
      );
    }
    
    if (oldVal !== null && newVal === null) {
      // Value deleted
      return (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600">{key}:</div>
          <div className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
            - {typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)}
          </div>
        </div>
      );
    }
    
    if (oldVal !== newVal) {
      // Value changed
      const textColor = isAmountField || isDelete ? 'text-red-700' : 'text-blue-700';
      const bgColor = isAmountField || isDelete ? 'bg-red-50' : 'bg-blue-50';
      
      return (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600">{key}:</div>
          <div className="space-y-1">
            <div className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
              - {typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)}
            </div>
            <div className={`text-sm ${textColor} ${bgColor} px-2 py-1 rounded`}>
              + {typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const handleExport = () => {
    const exportData = filteredLogs.map(log => ({
      timestamp: formatTimestamp(log.timestamp),
      user_email: log.user_email,
      action: log.action,
      table_name: log.table_name,
      record_id: log.record_id,
      severity: log.severity,
      ip_address: log.ip_address,
      old_values: JSON.stringify(log.old_values),
      new_values: JSON.stringify(log.new_values)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Log");

    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `audit_log_${currentDate}.xlsx`);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      user: 'all',
      action: 'all',
      table: 'all',
      severity: 'all',
    });
  };

  if (loading) {
    return <div className="p-6 text-center">Loading audit logs...</div>;
  }

  const uniqueUsers = [...new Set(auditLogs.map(log => log.user_email))];
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];
  const uniqueTables = [...new Set(auditLogs.map(log => log.table_name))];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Activities</p>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Users</p>
                <p className="text-2xl font-bold">{uniqueUsers.length}</p>
              </div>
              <User className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Critical Events</p>
                <p className="text-2xl font-bold">{auditLogs.filter(log => log.severity === 'critical').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Last 24 Hours</p>
                <p className="text-2xl font-bold">
                  {auditLogs.filter(log => 
                    new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Filter className="h-5 w-5" />
            Audit Log Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={filters.user} onValueChange={(value) => setFilters(prev => ({ ...prev, user: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Table</Label>
              <Select value={filters.table} onValueChange={(value) => setFilters(prev => ({ ...prev, table: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {uniqueTables.map(table => (
                    <SelectItem key={table} value={table}>{table}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
            <Button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Show Count Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Show:</Label>
          <Select value={showCount.toString()} onValueChange={(value) => setShowCount(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">Last 25</SelectItem>
              <SelectItem value="50">Last 50</SelectItem>
              <SelectItem value="100">Last 100</SelectItem>
              <SelectItem value="300">Last 300</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">
            activities (showing {filteredLogs.length} of {auditLogs.length})
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <>
                    <TableRow key={log.id} className={`hover:bg-gray-50 ${log.action === 'DELETE' ? 'bg-red-50' : ''}`}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(log.id)}
                          className="p-1"
                        >
                          {expandedRows.has(log.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium">{log.user_email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className={log.action === 'DELETE' ? 'text-red-600 font-medium' : ''}>{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {log.table_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.record_id}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityBadge(log.severity)}>
                          <div className="flex items-center gap-1">
                            {getSeverityIcon(log.severity)}
                            <span className="capitalize">{log.severity}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {log.action === 'INSERT' && 'New record created'}
                          {log.action === 'UPDATE' && Object.keys(log.old_values || {}).length + ' fields modified'}
                          {log.action === 'DELETE' && <span className="text-red-600 font-medium">Record deleted</span>}
                          {log.action === 'PASSWORD_CHANGE' && 'Password updated'}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(log.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-gray-50 p-4">
                          <div className="space-y-4">
                            <div className="text-sm font-medium text-gray-700">Change Details:</div>
                            
                            {log.action === 'DELETE' && log.old_values && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <h4 className="font-semibold text-sm text-red-800 mb-2">Deleted Data:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {Object.entries(log.old_values).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                      <span className="font-medium text-red-700">{key}:</span>
                                      <span className="ml-2 text-red-600">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {log.action === 'INSERT' && log.new_values && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <h4 className="font-semibold text-sm text-green-800 mb-2">Created Data:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {Object.entries(log.new_values).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                      <span className="font-medium text-green-700">{key}:</span>
                                      <span className="ml-2 text-green-600">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {log.action === 'UPDATE' && (log.old_values || log.new_values) && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h4 className="font-semibold text-sm text-blue-800 mb-2">Data Changes:</h4>
                                <div className="space-y-3">
                                  {log.old_values && log.new_values && Object.keys(log.old_values).map(key => (
                                    <div key={key}>
                                      {renderValueComparison(log.old_values[key], log.new_values[key], key)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-600 border-t pt-2">
                              <div><strong>IP Address:</strong> {log.ip_address}</div>
                              <div><strong>User Agent:</strong> {log.user_agent}</div>
                              <div><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No audit log entries found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
