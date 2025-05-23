
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Database, Info, Shield } from "lucide-react";
import { isMongoDbTimeoutError, isMixedContentEnvironment } from '@/services/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [networkError, setNetworkError] = React.useState(false);
  const [databaseError, setDatabaseError] = React.useState(false);
  const [isPreviewEnvironment, setIsPreviewEnvironment] = React.useState(false);
  const [showMixedContentDialog, setShowMixedContentDialog] = React.useState(false);
  
  React.useEffect(() => {
    // Check if we're running in the Lovable preview environment
    const isLovablePreview = window.location.hostname.includes('lovable.app');
    setIsPreviewEnvironment(isLovablePreview);
    
    // If we're in the preview environment, show a network error by default
    if (isLovablePreview) {
      setNetworkError(true);
    }
    
    // Check if we're in a mixed content scenario (HTTPS site trying to access HTTP API)
    if (isMixedContentEnvironment) {
      setShowMixedContentDialog(true);
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
      
      // Check if it's a mixed content error
      if (error instanceof Error && error.message.includes('Mixed Content')) {
        setShowMixedContentDialog(true);
      }
      
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
        
        {isMixedContentEnvironment && (
          <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertTitle>Security Warning</AlertTitle>
            <AlertDescription>
              You're accessing this app via HTTPS but your API server uses HTTP, which browsers block.
              For best results, access this app using HTTP or upgrade your API to support HTTPS.
            </AlertDescription>
          </Alert>
        )}
        
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

      {/* Mixed Content Dialog - shown when HTTPS site tries to access HTTP API */}
      <Dialog open={showMixedContentDialog} onOpenChange={setShowMixedContentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mixed Content Warning</DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-2">
                <p>
                  You're accessing this application through HTTPS (secure), but the API server uses HTTP (insecure).
                  Most modern browsers block this "mixed content" for security reasons.
                </p>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Solutions:</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>1. Access this app using HTTP instead of HTTPS</p>
                    <p>2. Configure your API server to support HTTPS</p>
                    <p>3. Use a browser with relaxed security settings for testing</p>
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-gray-500">
                  For development purposes only: Some browsers allow you to enable insecure content for specific sites 
                  in their security settings.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => setShowMixedContentDialog(false)} 
            className="mt-2"
          >
            I Understand
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
