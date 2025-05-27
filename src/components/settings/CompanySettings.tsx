
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanySettingsProps {
  userRole?: string;
}

export const CompanySettings = ({ userRole }: CompanySettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    company_name: '',
    address: '',
    email: '',
    phone: '',
    footer_note: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching company settings:', error);
      return;
    }

    if (data) {
      setSettings({
        company_name: data.company_name || '',
        address: data.address || '',
        email: data.email || '',
        phone: data.phone || '',
        footer_note: data.footer_note || ''
      });
    }
  };

  const handleUpdateSettings = async () => {
    if (userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can update company settings.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('company_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', (await supabase.from('company_settings').select('id').limit(1).single()).data?.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update company settings.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Company settings updated successfully!"
    });
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          value={settings.company_name}
          onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
          disabled={!isAdmin}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={settings.address}
          onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          disabled={!isAdmin}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={settings.email}
          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          disabled={!isAdmin}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={settings.phone}
          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
          disabled={!isAdmin}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="footer_note">Footer Note for Prints</Label>
        <Input
          id="footer_note"
          value={settings.footer_note}
          onChange={(e) => setSettings({ ...settings, footer_note: e.target.value })}
          disabled={!isAdmin}
          className="mt-1"
          placeholder="Thank you for your business"
        />
      </div>

      {isAdmin && (
        <Button
          onClick={handleUpdateSettings}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          {loading ? "Updating..." : "Update Company Settings"}
        </Button>
      )}

      {!isAdmin && (
        <p className="text-sm text-gray-500 text-center">
          Only administrators can modify company settings.
        </p>
      )}
    </div>
  );
};
