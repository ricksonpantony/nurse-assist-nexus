import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { UserManagement } from "@/components/settings/UserManagement";
import { PasswordUpdate } from "@/components/settings/PasswordUpdate";
import { Building2, Users, Lock } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Settings = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-white/80 backdrop-blur-lg px-6 shadow-sm">
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-blue-600/80">Manage your company settings and user accounts</p>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 space-y-6">
              <Tabs defaultValue="company" className="w-full space-y-4">
                <TabsList>
                  <TabsTrigger value="company" className="gap-2"><Building2 className="h-4 w-4" /> Company</TabsTrigger>
                  <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> User Management</TabsTrigger>
                  <TabsTrigger value="password" className="gap-2"><Lock className="h-4 w-4" /> Password</TabsTrigger>
                </TabsList>
                <TabsContent value="company">
                  <CompanySettings />
                </TabsContent>
                <TabsContent value="users">
                  <UserManagement />
                </TabsContent>
                <TabsContent value="password">
                  <PasswordUpdate />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
