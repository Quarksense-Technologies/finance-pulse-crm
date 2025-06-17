
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from '@/hooks/api/useProjects';
import { useCreateMaterialRequest } from '@/hooks/api/useMaterials';

interface MaterialRequestFormProps {
  preselectedProjectId?: string;
  onSubmit?: () => void;
}

const MaterialRequestForm: React.FC<MaterialRequestFormProps> = ({ preselectedProjectId, onSubmit }) => {
  const { data: projects = [] } = useProjects();
  const createMaterialRequestMutation = useCreateMaterialRequest();
  
  const form = useForm({
    defaultValues: {
      projectId: preselectedProjectId || '',
      description: '',
      partNo: '',
      quantity: '',
      estimatedCost: '',
      urgency: 'medium',
      notes: '',
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await createMaterialRequestMutation.mutateAsync({
        projectId: data.projectId,
        description: data.description,
        partNo: data.partNo || undefined,
        quantity: parseInt(data.quantity),
        estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : undefined,
        urgency: data.urgency,
        notes: data.notes || undefined,
      });
      
      form.reset();
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error creating material request:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project *</FormLabel>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Material description..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="partNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Part number..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" placeholder="1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimatedCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Cost ($)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urgency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Additional notes..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={createMaterialRequestMutation.isPending}>
            {createMaterialRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MaterialRequestForm;
