
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";

export default function AdminDataMigration() {
  const { user } = useAuth();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!confirm("⚠️ This will REPLACE all production data with development data. Are you sure?")) {
      return;
    }

    setImporting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/import-production-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Import failed");
      }

      setResult(data.imported);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setImporting(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Admin access required. Please login as an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Production Data Migration</CardTitle>
          <CardDescription>
            Import development data to production database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will completely replace all production data with development data.
              Make sure you have exported the latest development data before proceeding.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold">Migration Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Export development data using: <code className="bg-muted px-2 py-1 rounded">npx tsx scripts/export-production-data.ts</code></li>
              <li>Commit and push the production-data.json file</li>
              <li>Deploy the application to production</li>
              <li>Click the "Import to Production" button below</li>
              <li>Verify the imported data</li>
            </ol>
          </div>

          <Button 
            onClick={handleImport} 
            disabled={importing}
            variant="destructive"
            className="w-full"
          >
            {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {importing ? "Importing..." : "Import to Production"}
          </Button>

          {result && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Import Successful!</strong>
                <div className="mt-2 space-y-1 text-sm">
                  <div>✅ Users: {result.users}</div>
                  <div>✅ Venues: {result.venues}</div>
                  <div>✅ Organizers: {result.organizers}</div>
                  <div>✅ Service Providers: {result.serviceProviders}</div>
                  <div>✅ Events: {result.events}</div>
                  <div>✅ Event Registrations: {result.eventRegistrations}</div>
                  <div>✅ Messages: {result.messages}</div>
                  <div>✅ Reviews: {result.reviews}</div>
                  <div>✅ Service Bookings: {result.serviceBookings}</div>
                  <div>✅ Password Tokens: {result.passwordResetTokens}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Import Failed:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Current Environment Info:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Environment: {process.env.NODE_ENV || 'development'}</div>
              <div>Admin User: {user.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
