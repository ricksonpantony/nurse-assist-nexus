import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Filter, Eye, Search } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const AuditLogs = () => {
  const { logs, loading, fetchAuditLogs } = useAuditLogs();
  const [filters, setFilters] = useState({
    table_name: 'all',
    action: 'all',
    severity: 'all',
    search: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Apply filters
    fetchAuditLogs({
      table_name: newFilters.table_name === 'all' ? undefined : newFilters.table_name,
      action: newFilters.action === 'all' ? undefined : newFilters.action,
      severity: newFilters.severity === 'all' ? undefined : newFilters.severity,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      log.table_name.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.user_email?.toLowerCase().includes(searchLower) ||
      log.record_id.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Loading audit logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Audit Logs
            </h1>
            <p className="text-sm text-blue-600">
              System activity and change tracking
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAuditLogs()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search logs..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Table</Label>
                    <Select value={filters.table_name} onValueChange={(value) => handleFilterChange('table_name', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All tables" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tables</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="payments">Payments</SelectItem>
                        <SelectItem value="courses">Courses</SelectItem>
                        <SelectItem value="referrals">Referrals</SelectItem>
                        <SelectItem value="leads">Leads</SelectItem>
                        <SelectItem value="referral_payments">Referral Payments</SelectItem>
                        <SelectItem value="user_profiles">User Profiles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Action</Label>
                    <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All actions</SelectItem>
                        <SelectItem value="INSERT">Insert</SelectItem>
                        <SelectItem value="UPDATE">Update</SelectItem>
                        <SelectItem value="DELETE">Delete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Severity</Label>
                    <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All severities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({ table_name: 'all', action: 'all', severity: 'all', search: '' });
                        fetchAuditLogs();
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity ({filteredLogs.length} logs)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                            <Badge variant="outline">
                              {log.table_name}
                            </Badge>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p><strong>Record ID:</strong> {log.record_id}</p>
                            <p><strong>User:</strong> {log.user_email || 'System'}</p>
                            <p><strong>Timestamp:</strong> {formatTimestamp(log.timestamp)}</p>
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Audit Log Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Action</Label>
                                  <p className="font-medium">{log.action}</p>
                                </div>
                                <div>
                                  <Label>Table</Label>
                                  <p className="font-medium">{log.table_name}</p>
                                </div>
                                <div>
                                  <Label>Record ID</Label>
                                  <p className="font-medium">{log.record_id}</p>
                                </div>
                                <div>
                                  <Label>Severity</Label>
                                  <Badge className={getSeverityColor(log.severity)}>
                                    {log.severity}
                                  </Badge>
                                </div>
                                <div>
                                  <Label>User</Label>
                                  <p className="font-medium">{log.user_email || 'System'}</p>
                                </div>
                                <div>
                                  <Label>Timestamp</Label>
                                  <p className="font-medium">{formatTimestamp(log.timestamp)}</p>
                                </div>
                              </div>
                              
                              {log.old_values && (
                                <div>
                                  <Label>Old Values</Label>
                                  <ScrollArea className="h-32 w-full border rounded p-2 bg-red-50">
                                    <pre className="text-xs">{JSON.stringify(log.old_values, null, 2)}</pre>
                                  </ScrollArea>
                                </div>
                              )}
                              
                              {log.new_values && (
                                <div>
                                  <Label>New Values</Label>
                                  <ScrollArea className="h-32 w-full border rounded p-2 bg-green-50">
                                    <pre className="text-xs">{JSON.stringify(log.new_values, null, 2)}</pre>
                                  </ScrollArea>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                  
                  {filteredLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No audit logs found matching your criteria.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuditLogs;
