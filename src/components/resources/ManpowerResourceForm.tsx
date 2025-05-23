
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { projects } from '@/data/mockData';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the form schema
const formSchema = z.object({
  projectId: z.string({
    required_error: "Please select a project",
  }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.string().min(2, { message: "Role must be at least 2 characters" }),
  hoursAllocated: z.coerce.number().positive({ message: "Hours must be a positive number" }),
  hourlyRate: z.coerce.number().positive({ message: "Hourly rate must be a positive number" }),
  startDate: z.string(),
  endDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ManpowerResourceFormProps {
  onResourceAdded: () => void;
}

const ManpowerResourceForm: React.FC<ManpowerResourceFormProps> = ({ onResourceAdded }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      name: "",
      role: "",
      hoursAllocated: 0,
      hourlyRate: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // In a real app, this would send data to a backend
    // For now, we'll just simulate adding a resource
    const newResource = {
      id: `res-${Date.now()}`,
      projectId: data.projectId,
      name: data.name,
      role: data.role,
      hoursAllocated: data.hoursAllocated,
      hourlyRate: data.hourlyRate,
      startDate: data.startDate,
      endDate: data.endDate || null,
    };

    // Find the project and add the resource
    const project = projects.find(p => p.id === data.projectId);
    if (project) {
      project.resources.push(newResource);
      project.manpowerAllocated += data.hoursAllocated;
    }

    // Notify success
    toast({
      title: "Resource added",
      description: `${data.name} has been allocated to the project.`,
    });

    // Reset form
    form.reset();

    // Trigger refresh in parent component
    onResourceAdded();
  };

  // Update the filter to include projects with 'in-progress' status
  const activeProjects = projects.filter(p => p.status === 'in-progress');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Add Manpower Resource</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeProjects.map((project) => (
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
              name="hoursAllocated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Allocated</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="Hours" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
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
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="Rate" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
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
                  <FormLabel>End Date (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full">Add Resource</Button>
        </form>
      </Form>
    </div>
  );
};

export default ManpowerResourceForm;
