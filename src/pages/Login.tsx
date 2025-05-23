
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Database, Info } from "lucide-react";
import { isMongoDbTimeoutError } from '@/services/api/client';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [networkError, setNetworkError] = React.useState(false);
  const [databaseError, setDatabaseError] = React.useState(false);
  const [isPreviewEnvironment, setIsPreviewEnvironment] = React.useState(false);
  
  React.useEffect(() => {
    // Check if we're running in the Lovable preview environment
    const isLovablePreview = window.location.hostname.includes('lovable.app');
    setIsPreviewEnvironment(isLovablePreview);
    
    // If we're in the preview environment, show a network error by default
    if (isLovablePreview) {
      setNetworkError(true);
    }
  }, []);
  
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Add debug logging
  console.log('Login component rendering');

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setNetworkError(false);
    setDatabaseError(false);
    
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
      
      // Check if we're in the preview environment
      if (window.location.hostname.includes('lovable.app')) {
        setNetworkError(true);
      } else {
        // Only check these errors if we're not in preview
        // Check if it's a network error
        if (error instanceof Error && error.message.includes("Network Error")) {
          setNetworkError(true);
        }
        
        // Check if it's a MongoDB connection error
        if (error instanceof Error && isMongoDbTimeoutError(error)) {
          setDatabaseError(true);
        }
      }
      
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        
        {isPreviewEnvironment && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Preview Environment</AlertTitle>
            <AlertDescription>
              You are in the Lovable preview environment. The application is attempting to connect to an external server at {import.meta.env.VITE_API_URL}, but preview environments have limited network connectivity. To test the full application, please run it locally.
            </AlertDescription>
          </Alert>
        )}
        
        {networkError && !isPreviewEnvironment && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>
              Cannot connect to the API server. Please check if the server is running at {import.meta.env.VITE_API_URL}.
            </AlertDescription>
          </Alert>
        )}
        
        {databaseError && (
          <Alert variant="warning" className="mb-4">
            <Database className="h-4 w-4" />
            <AlertTitle>Database Connection Issue</AlertTitle>
            <AlertDescription>
              The server couldn't connect to the database. This typically happens when the database is starting up or is experiencing connectivity issues. Please try again in a few moments.
            </AlertDescription>
          </Alert>
        )}
        
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
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
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
