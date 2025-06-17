import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useProjects } from '@/hooks/api/useProjects';
import { useCreateMaterialPurchase } from '@/hooks/api/useMaterials';

interface MultiItemMaterialPurchaseFormProps {
  preselectedProjectId?: string;
  onSubmit?: () => void;
}

const MultiItemMaterialPurchaseForm: React.FC<MultiItemMaterialPurchaseFormProps> = ({ 
  preselectedProjectId, 
  onSubmit 
}) => {
  const { data: projects = [] } = useProjects();
  const createMaterialPurchaseMutation = useCreateMaterialPurchase();
  const [attachments, setAttachments] = useState<{[key: number]: File[]}>({});
  
  const form = useForm({
    defaultValues: {
      projectId: preselectedProjectId || '',
      vendor: '',
      purchaseDate: new Date().toISOString().slice(0, 10),
      items: [{
        description: '',
        partNo: '',
        hsn: '',
        quantity: '',
        price: '',
        gst: '18',
        invoiceNumber: '',
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

  const handleSubmit = async (data: any) => {
    try {
      // Submit each item as a separate purchase
      for (const [index, item] of data.items.entries()) {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const gst = parseFloat(item.gst) || 0;
        const subtotal = quantity * price;
        const gstAmount = (subtotal * gst) / 100;
        const totalAmount = subtotal + gstAmount;

        const itemAttachments = attachments[index] || [];
        // Create proper attachment data with base64 or file data
        const attachmentData = itemAttachments.map(file => ({
          name: file.name,
          url: `data:${file.type};base64,${btoa(String.fromCharCode(...new Uint8Array(file as any)))}`, // Simplified for demo
          type: file.type
        }));

        const purchaseData = {
          projectId: data.projectId,
          description: item.description,
          partNo: item.partNo || undefined,
          hsn: item.hsn || undefined,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          gst: parseFloat(item.gst),
          totalAmount: totalAmount,
          vendor: data.vendor || undefined,
          purchaseDate: data.purchaseDate,
          invoiceNumber: item.invoiceNumber || undefined,
          attachments: attachmentData,
        };

        console.log('Sending purchase data:', purchaseData);

        await createMaterialPurchaseMutation.mutateAsync(purchaseData);
      }
      
      form.reset();
      setAttachments({});
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error creating material purchases:', error);
    }
  };

  const addItem = () => {
    append({
      description: '',
      partNo: '',
      hsn: '',
      quantity: '',
      price: '',
      gst: '18',
      invoiceNumber: '',
    });
  };

  const calculateItemTotal = (index: number) => {
    const item = form.watch(`items.${index}`);
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const gst = parseFloat(item.gst) || 0;
    const subtotal = quantity * price;
    const gstAmount = (subtotal * gst) / 100;
    return subtotal + gstAmount;
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Vendor name..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date *</FormLabel>
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
              <h3 className="text-lg font-semibold">Purchase Items</h3>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        name={`items.${index}.hsn`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HSN Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="HSN code..." />
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
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price ($) *</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.gst`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST (%)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" max="100" placeholder="18" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.invoiceNumber`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2 lg:col-span-1">
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Invoice number..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* File Attachments */}
                    <div className="space-y-2">
                      <FormLabel>Attachments</FormLabel>
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
                          Upload Invoice/Files
                        </Button>
                      </div>
                      
                      {attachments[index] && attachments[index].length > 0 && (
                        <div className="space-y-2">
                          {attachments[index].map((file, fileIndex) => (
                            <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm truncate">{file.name}</span>
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

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">
                        Item Total: <span className="text-green-600 font-bold">
                          ${calculateItemTotal(index).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={createMaterialPurchaseMutation.isPending}>
              {createMaterialPurchaseMutation.isPending ? 'Saving...' : 'Save All Purchases'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MultiItemMaterialPurchaseForm;
