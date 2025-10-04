import { useQuery } from "@tanstack/react-query";

interface UseAuthOptions {
  enabled?: boolean;
}

export function useAuth(options?: UseAuthOptions) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? false, // Disabled by default - no automatic login
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
