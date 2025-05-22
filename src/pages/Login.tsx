
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Add debug logging
  console.log('Login component rendering');

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      console.log('Login attempt with:', { email: data.email });
      await login(data.email, data.password);
      console.log('Login successful');
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/');
    } catch (error) {
      console.error('Login failed with error:', error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  // Add logging for form submission
  React.useEffect(() => {
    const subscription = form.watch(() => {
      console.log('Form values changed:', form.getValues());
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Business CRM</h1>
        <h2 className="text-xl font-semibold mb-6">Log in to your account</h2>
        
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log('Form submission initiated');
              form.handleSubmit(onSubmit)(e);
            }} 
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                console.log('Email field rendering with value:', field.value);
                return (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="admin@example.com" 
                        type="email" 
                        {...field} 
                        autoComplete="email"
                        onChange={(e) => {
                          console.log('Email changed:', e.target.value);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                console.log('Password field rendering');
                return (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        {...field} 
                        autoComplete="current-password"
                        onChange={(e) => {
                          console.log('Password changed (length):', e.target.value.length);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-6"
              onClick={() => console.log('Login button clicked')}
            >
              Log in
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo credentials:</p>
          <p>Email: admin@example.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
