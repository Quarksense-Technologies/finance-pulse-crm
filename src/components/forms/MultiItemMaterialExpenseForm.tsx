import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useProjects } from '@/hooks/api/useProjects';
import { useCreateTransaction } from '@/hooks/api/useFinances';
import { toast } from "@/hooks/use-toast";

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
  const [attachments, setAttachments] = useState<{[key: number]: File[]}>({});
  
  // Maximum file size: 5MB per file
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  
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

  const handleFileUpload = (index: number, files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      
      // Check file sizes
      const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        toast({
          title: "File too large",
          description: `Files must be smaller than 5MB. Please compress or use smaller files.`,
          variant: "destructive"
        });
        return;
      }
      
      setAttachments(prev => ({
        ...prev,
        [index]: [...(prev[index] || []), ...newFiles]
      }));
    }
  };

  const removeAttachment = (itemIndex: number, fileIndex: number) => {
    setAttachments(prev => ({
      ...prev,
      [itemIndex]: prev[itemIndex]?.filter((_, i) => i !== fileIndex) || []
    }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get only the base64 data
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (data: any) => {
    try {
      // Submit each item as a separate expense
      for (const [index, item] of data.items.entries()) {
        const itemAttachments = attachments[index] || [];
        
        // Check total attachment size for this item
        const totalSize = itemAttachments.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > MAX_FILE_SIZE * 2) { // Allow up to 10MB total per item
          toast({
            title: "Attachments too large",
            description: `Total attachment size for item ${index + 1} exceeds 10MB. Please reduce file sizes.`,
            variant: "destructive"
          });
          continue;
        }
        
        // Convert files to the format expected by the finance API (with url property)
        const attachmentData = itemAttachments.map(file => ({
          name: file.name,
          url: URL.createObjectURL(file), // Finance API expects url format
        }));

        const transactionData = {
          type: 'expense' as const,
          amount: parseFloat(item.amount),
          description: `Material Expense: ${item.description}`,
          category: 'materials',
          project: data.projectId,
          date: data.date,
          attachments: attachmentData,
        };

        console.log('Sending transaction data:', transactionData);

        await createTransactionMutation.mutateAsync(transactionData);
      }
      
      form.reset();
      setAttachments({});
      if (onSubmit) onSubmit();
    } catch (error: any) {
      console.error('Error creating material expenses:', error);
      if (error.response?.status === 413) {
        toast({
          title: "Request too large",
          description: "Files are too large. Please use smaller files or fewer attachments.",
          variant: "destructive"
        });
      }
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
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-1">
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
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex justify-between items-center">
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
                    </div>

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

                    {/* File Attachments with size validation */}
                    <div className="space-y-2">
                      <FormLabel>Attachments (Max 5MB per file)</FormLabel>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleFileUpload(index, e.target.files)}
                          className="hidden"
                          id={`file-upload-${index}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                      
                      {attachments[index] && attachments[index].length > 0 && (
                        <div className="space-y-2">
                          {attachments[index].map((file, fileIndex) => (
                            <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm truncate">
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index, fileIndex)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Amount</h3>
            <p className="text-3xl font-bold text-red-600">
              ${calculateTotal().toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={createTransactionMutation.isPending}>
              {createTransactionMutation.isPending ? 'Saving...' : 'Save All Expenses'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MultiItemMaterialExpenseForm;
