"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { CreditCard, Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";
import { useState } from "react";

export default function PaymentSettingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [showSecrets, setShowSecrets] = useState(false);

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Settings"
        description="Configure payment gateways (Super Admin Only)"
      />

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Security Notice</p>
              <p className="text-sm text-yellow-700">
                Secret keys are never exposed to the frontend. Only environment variables are used.
                Add keys to .env file and restart the server.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stripe">
        <TabsList>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="sslcommerz">SSLCommerz</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Stripe Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Publishable Key (Public)</Label>
                <Input
                  defaultValue={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
                  placeholder="pk_live_... or pk_test_..."
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env
                </p>
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets ? "text" : "password"}
                    value="sk_************************"
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set STRIPE_SECRET_KEY in .env (never expose to frontend)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <Input
                  type="password"
                  value="whsec_************************"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Set STRIPE_WEBHOOK_SECRET in .env
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Test Mode</p>
                  <p className="text-sm text-muted-foreground">Use Stripe test environment</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Enabled</p>
                  <p className="text-sm text-muted-foreground">Allow Stripe payments</p>
                </div>
                <Badge variant="outline">Disabled</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sslcommerz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                SSLCommerz Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Store ID</Label>
                <Input
                  defaultValue={process.env.SSLCOMMERZ_STORE_ID || ""}
                  placeholder="wildp5ee0c..."
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Set SSLCOMMERZ_STORE_ID in .env
                </p>
              </div>
              <div className="space-y-2">
                <Label>Store Password</Label>
                <Input
                  type="password"
                  value="************************"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Set SSLCOMMERZ_STORE_PASSPHRASE in .env
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Sandbox Mode</p>
                  <p className="text-sm text-muted-foreground">Use SSLCommerz sandbox</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Enabled</p>
                  <p className="text-sm text-muted-foreground">Allow SSLCommerz payments</p>
                </div>
                <Badge variant="outline">Disabled</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="BDT">BDT (৳)</option>
                  <option value="NPR">NPR (₨)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" defaultValue="13" />
              </div>
              <div className="space-y-2">
                <Label>Deposit Percentage (%)</Label>
                <Input type="number" defaultValue="20" />
              </div>
              <div className="space-y-2">
                <Label>Full Refund Days Before</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label>Partial Refund Days Before</Label>
                <Input type="number" defaultValue="14" />
              </div>
              <div className="space-y-2">
                <Label>Partial Refund Percentage (%)</Label>
                <Input type="number" defaultValue="50" />
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
