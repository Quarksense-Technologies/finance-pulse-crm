
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projects } from '@/data/mockData';
import { Resource } from '@/data/types';

interface ResourceFormProps {
  preselectedProjectId?: string;
  onSubmit: (data: Partial<Resource>) => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ preselectedProjectId, onSubmit }) => {
  const form = useForm({
    defaultValues: {
      projectId: preselectedProjectId || '',
      name: '',
      role: '',
      hoursAllocated: '',
      hourlyRate: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit({
      id: `resource-${Date.now()}`,
      projectId: data.projectId,
      name: data.name,
      role: data.role,
      hoursAllocated: parseInt(data.hoursAllocated, 10),
      hourlyRate: parseFloat(data.hourlyRate),
      startDate: data.startDate,
      endDate: data.endDate || null,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select 
                disabled={!!preselectedProjectId}
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Resource name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Designer, Developer, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hoursAllocated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hours Allocated</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" placeholder="40" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" step="0.01" placeholder="25.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="flex justify-end">
          <Button type="submit">Assign Resource</Button>
        </div>
      </form>
    </Form>
  );
};

export default ResourceForm;
