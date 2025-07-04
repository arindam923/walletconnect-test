import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

interface UserPoints {
  walletAddress: string;
  points: number;
}

const fetchUserPoints = async (walletAddress: string): Promise<UserPoints> => {
  if (!walletAddress) return { walletAddress: '', points: 0 };
  
  const response = await fetch(`/api/points?walletAddress=${walletAddress}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user points');
  }
  
  const { data } = await response.json();
  return data;
};

const updateUserPoints = async ({
  walletAddress,
  points,
  action = 'add',
}: {
  walletAddress: string;
  points: number;
  action?: 'add' | 'set';
}): Promise<UserPoints> => {
  const response = await fetch('/api/points', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress, points, action }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user points');
  }
  
  const { data } = await response.json();
  return data;
};

export const useUserPoints = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  const walletAddress = address as string;
    const query = useQuery({
    queryKey: ['userPoints', walletAddress],
    queryFn: () => fetchUserPoints(walletAddress),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const mutation = useMutation({
    mutationFn: updateUserPoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPoints', walletAddress] });
    },
  });
  
  return {
    points: query.data?.points || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updatePoints: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};