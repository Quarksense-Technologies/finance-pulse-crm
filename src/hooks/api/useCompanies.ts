import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/api/companyService';
import { toast } from "@/components/ui/use-toast";

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getCompanies,
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getCompanyById(id),
    enabled: !!id && id !== 'undefined', // Only run if id is valid
    retry: (failureCount, error) => {
      // Don't retry 404 errors
      if ((error as any)?.response?.status === 404) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: companyService.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create company",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      companyService.updateCompany(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update company",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete company",
        variant: "destructive"
      });
    },
  });
};
