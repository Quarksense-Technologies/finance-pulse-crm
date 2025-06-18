
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Resource } from '@/data/types';

interface ResourceFormProps {
  onSubmit: (data: Partial<Resource>) => void;
  onCancel?: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm({
    defaultValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
      hourlyRate: '',
      skills: '',
      department: '',
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit({
      name: data.name,
      role: data.role,
      email: data.email,
      phone: data.phone || undefined,
      hourlyRate: parseFloat(data.hourlyRate) || 0,
      skills: data.skills ? data.skills.split(',').map((s: string) => s.trim()) : [],
      department: data.department || undefined,
      isActive: true,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="email@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Phone number" />
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

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills (comma-separated)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="React, Node.js, Python" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Engineering, Design, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Add Resource</Button>
        </div>
      </form>
    </Form>
  );
};

export default ResourceForm;
