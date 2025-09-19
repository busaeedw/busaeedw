import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: false, // Disable automatic authentication check
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
