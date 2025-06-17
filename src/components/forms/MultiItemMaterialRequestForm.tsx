
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { useProjects } from '@/hooks/api/useProjects';
import { useCreateMaterialRequest } from '@/hooks/api/useMaterials';

interface MultiItemMaterialRequestFormProps {
  preselectedProjectId?: string;
  onSubmit?: () => void;
}

const MultiItemMaterialRequestForm: React.FC<MultiItemMaterialRequestFormProps> = ({ 
  preselectedProjectId, 
  onSubmit 
}) => {
  const { data: projects = [] } = useProjects();
  const createMaterialRequestMutation = useCreateMaterialRequest();
  
  const form = useForm({
    defaultValues: {
      projectId: preselectedProjectId || '',
      items: [{
        description: '',
        partNo: '',
        quantity: '',
        estimatedCost: '',
        urgency: 'medium',
        notes: '',
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const handleSubmit = async (data: any) => {
    try {
      // Submit each item as a separate request
      for (const item of data.items) {
        await createMaterialRequestMutation.mutateAsync({
          projectId: data.projectId,
          description: item.description,
          partNo: item.partNo || undefined,
          quantity: parseInt(item.quantity),
          estimatedCost: item.estimatedCost ? parseFloat(item.estimatedCost) : undefined,
          urgency: item.urgency,
          notes: item.notes || undefined,
        });
      }
      
      form.reset();
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error creating material requests:', error);
    }
  };

  const addItem = () => {
    append({
      description: '',
      partNo: '',
      quantity: '',
      estimatedCost: '',
      urgency: 'medium',
      notes: '',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Material Items</h3>
            <Button type="button" onClick={addItem} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
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

                  <FormField
                    control={form.control}
                    name={`items.${index}.partNo`}
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
                    name={`items.${index}.quantity`}
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

                  <FormField
                    control={form.control}
                    name={`items.${index}.estimatedCost`}
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
                    name={`items.${index}.urgency`}
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

                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Additional notes..." rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={createMaterialRequestMutation.isPending}>
            {createMaterialRequestMutation.isPending ? 'Submitting...' : 'Submit All Requests'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MultiItemMaterialRequestForm;
