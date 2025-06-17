
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/ProjectDetails';
import Companies from '@/pages/Companies';
import CompanyDetails from '@/pages/CompanyDetails';
import Finances from '@/pages/Finances';
import Materials from '@/pages/Materials';
import Resources from '@/pages/Resources';
import Attendance from '@/pages/Attendance';
import UserManagement from '@/pages/UserManagement';
import Settings from '@/pages/Settings';
import Approvals from '@/pages/Approvals';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:id" element={<ProjectDetails />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="companies/:id" element={<CompanyDetails />} />
                  <Route path="finances" element={<Finances />} />
                  <Route path="materials" element={<Materials />} />
                  <Route path="resources" element={<Resources />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="approvals" element={<Approvals />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
