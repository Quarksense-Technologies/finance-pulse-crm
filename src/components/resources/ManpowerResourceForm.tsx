
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { resourceService } from '@/services/api/resourceService';
import { useQueryClient } from '@tanstack/react-query';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.string().min(2, { message: "Role must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().optional(),
  hourlyRate: z.coerce.number().positive({ message: "Hourly rate must be a positive number" }),
  skills: z.string().optional(),
  department: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ManpowerResourceFormProps {
  onResourceAdded: () => void;
}

const ManpowerResourceForm: React.FC<ManpowerResourceFormProps> = ({ onResourceAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
      hourlyRate: 0,
      skills: "",
      department: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create the resource using the API service
      await resourceService.createResource({
        name: data.name,
        role: data.role,
        email: data.email,
        phone: data.phone,
        hourlyRate: data.hourlyRate,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
        department: data.department
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      
      // Reset form
      form.reset();
      
      // Trigger refresh in parent component
      onResourceAdded();
    } catch (error) {
      console.error('Error adding resource:', error);
      // Error toast is handled by the API service
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Add Resource</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resource name" {...field} />
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
                    <Input placeholder="Enter role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      {...field} 
                    />
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
                    <Input 
                      placeholder="Phone number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="Rate" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
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
                    <Input 
                      placeholder="Engineering, Design, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills (comma-separated, optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="React, Node.js, Python" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Resource'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ManpowerResourceForm;
