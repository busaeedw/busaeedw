import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";

export default function RoleBasedHome() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (!isLoading && user?.role === 'admin') {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);

  // Show loading state while checking user role
  if (isLoading) {
    return null;
  }

  // Show regular dashboard for non-admin users
  return <Dashboard />;
}
