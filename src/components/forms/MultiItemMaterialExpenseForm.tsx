
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { useProjects } from '@/hooks/api/useProjects';
import { useCreateTransaction } from '@/hooks/api/useFinances';

interface MultiItemMaterialExpenseFormProps {
  preselectedProjectId?: string;
  onSubmit?: () => void;
}

const MultiItemMaterialExpenseForm: React.FC<MultiItemMaterialExpenseFormProps> = ({ 
  preselectedProjectId, 
  onSubmit 
}) => {
  const { data: projects = [] } = useProjects();
  const createTransactionMutation = useCreateTransaction();
  
  const form = useForm({
    defaultValues: {
      projectId: preselectedProjectId || '',
      date: new Date().toISOString().slice(0, 10),
      items: [{
        description: '',
        amount: '',
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
      // Submit each item as a separate expense
      for (const item of data.items) {
        await createTransactionMutation.mutateAsync({
          type: 'expense',
          amount: parseFloat(item.amount),
          description: `Material Expense: ${item.description}`,
          category: 'materials',
          project: data.projectId,
          date: data.date,
          notes: item.notes || undefined,
        });
      }
      
      form.reset();
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error creating material expenses:', error);
    }
  };

  const addItem = () => {
    append({
      description: '',
      amount: '',
      notes: '',
    });
  };

  const calculateTotal = () => {
    const items = form.watch('items');
    return items.reduce((total, item) => {
      return total + (parseFloat(item.amount) || 0);
    }, 0);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expense Items</h3>
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
                          <Input {...field} placeholder="Expense description..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($) *</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
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

        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-red-600">
            ${calculateTotal().toFixed(2)}
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={createTransactionMutation.isPending}>
            {createTransactionMutation.isPending ? 'Saving...' : 'Save All Expenses'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MultiItemMaterialExpenseForm;
