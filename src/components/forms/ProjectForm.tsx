
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from '@/data/types';
import { useCompanies } from '@/hooks/api/useCompanies';

interface ProjectFormProps {
  onSubmit: (data: Partial<Project>) => void;
  preselectedCompanyId?: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, preselectedCompanyId }) => {
  // Fetch companies from API
  const { data: companies = [], isLoading } = useCompanies();

  const form = useForm({
    defaultValues: {
      name: '',
      companyId: preselectedCompanyId || '',
      description: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      status: 'active',
      manpowerAllocated: '',
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit({
      name: data.name,
      companyId: data.companyId,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate || null,
      status: data.status as 'active' | 'completed' | 'on-hold',
      manpowerAllocated: parseInt(data.manpowerAllocated, 10) || 0,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Project name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select 
                disabled={!!preselectedCompanyId || isLoading}
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading companies..." : "Select a company"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Project description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manpowerAllocated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Hours</FormLabel>
              <FormControl>
                <Input {...field} type="number" min="0" placeholder="0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Save Project</Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;
