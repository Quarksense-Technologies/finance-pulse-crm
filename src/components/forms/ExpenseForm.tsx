
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Expense } from '@/data/types';
import { useProjects } from '@/hooks/api/useProjects';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ExpenseFormProps {
  preselectedProjectId?: string;
  onSubmit: (data: Partial<Expense>) => void;
}

// Default expense categories
const DEFAULT_CATEGORIES = ['manpower', 'materials', 'services', 'other'];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ preselectedProjectId, onSubmit }) => {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  // Fetch projects from API
  const { data: projects = [], isLoading } = useProjects();
  
  // All available categories (default + custom)
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const form = useForm({
    defaultValues: {
      projectId: preselectedProjectId || '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      category: 'materials',
      description: '',
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit({
      projectId: data.projectId,
      amount: parseFloat(data.amount),
      date: data.date,
      category: data.category,
      description: data.description,
    });
    form.reset();
  };

  const handleAddCategory = () => {
    if (newCategory && !allCategories.includes(newCategory)) {
      setCustomCategories([...customCategories, newCategory]);
      setNewCategory('');
      setIsAddingCategory(false);
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
              <FormLabel>Project</FormLabel>
              <Select 
                disabled={!!preselectedProjectId || isLoading}
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading projects..." : "Select a project"} />
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Popover open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsAddingCategory(true)}
                      className="px-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Add Custom Category</h4>
                      <div className="flex gap-2">
                        <Input 
                          value={newCategory} 
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category" 
                        />
                        <Button type="button" onClick={handleAddCategory}>Add</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
                <Input {...field} placeholder="Expense description..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Save Expense</Button>
        </div>
      </form>
    </Form>
  );
};

export default ExpenseForm;
