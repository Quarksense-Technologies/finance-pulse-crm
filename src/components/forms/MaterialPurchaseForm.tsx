
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from '@/hooks/api/useProjects';
import { useCreateMaterialPurchase } from '@/hooks/api/useMaterials';

interface MaterialPurchaseFormProps {
  preselectedProjectId?: string;
  onSubmit?: () => void;
}

const MaterialPurchaseForm: React.FC<MaterialPurchaseFormProps> = ({ preselectedProjectId, onSubmit }) => {
  const { data: projects = [] } = useProjects();
  const createMaterialPurchaseMutation = useCreateMaterialPurchase();
  
  const form = useForm({
    defaultValues: {
      projectId: preselectedProjectId || '',
      description: '',
      partNo: '',
      hsn: '',
      quantity: '',
      price: '',
      gst: '18',
      vendor: '',
      purchaseDate: new Date().toISOString().slice(0, 10),
      invoiceNumber: '',
    },
  });

  const quantity = form.watch('quantity');
  const price = form.watch('price');
  const gst = form.watch('gst');

  const calculateTotalAmount = () => {
    const qty = parseFloat(quantity) || 0;
    const unitPrice = parseFloat(price) || 0;
    const gstRate = parseFloat(gst) || 0;
    
    const subtotal = qty * unitPrice;
    const gstAmount = (subtotal * gstRate) / 100;
    return subtotal +

 gstAmount;
  };

  const totalAmount = calculateTotalAmount();

  const handleSubmit = async (data: any) => {
    try {
      await createMaterialPurchaseMutation.mutateAsync({
        projectId: data.projectId,
        description: data.description,
        partNo: data.partNo || undefined,
        hsn: data.hsn || undefined,
        quantity: parseInt(data.quantity),
        price: parseFloat(data.price),
        gst: parseFloat(data.gst),
        totalAmount: totalAmount,
        vendor: data.vendor || undefined,
        purchaseDate: data.purchaseDate,
        invoiceNumber: data.invoiceNumber || undefined,
      });
      
      form.reset();
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error creating material purchase:', error);
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
            name="hsn"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <FormField
            control={form.control}
            name="price"
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
            name="gst"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Invoice number..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-green-600">
            ${totalAmount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Includes GST: ${((totalAmount * parseFloat(gst || '0')) / (100 + parseFloat(gst || '0'))).toFixed(2)}
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={createMaterialPurchaseMutation.isPending}>
            {createMaterialPurchaseMutation.isPending ? 'Saving...' : 'Save Purchase'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MaterialPurchaseForm;
