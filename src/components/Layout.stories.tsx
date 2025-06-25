
import type { Story } from "@ladle/react";
import Layout from "./Layout";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock auth context
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    user: {
      name: "John Doe",
      email: "john@example.com",
      role: "admin"
    },
    logout: () => {},
    hasPermission: () => true
  };

  return (
    <div style={{ '--auth-context': JSON.stringify(mockAuthValue) } as any}>
      {children}
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

export const Default: Story = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider>
        <Layout>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Sample Content</h1>
            <p className="text-muted-foreground">
              This is how your layout looks with sample content.
            </p>
          </div>
        </Layout>
      </MockAuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

Default.meta = {
  title: "Layout/Main Layout",
};
