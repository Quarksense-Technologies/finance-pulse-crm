
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
import Materials from './pages/Materials';
import MaterialRequests from './pages/MaterialRequests';
import MaterialPurchases from './pages/MaterialPurchases';
import MaterialExpenses from './pages/MaterialExpenses';
import MaterialRequestsPage from './pages/MaterialRequestsPage';
import MaterialPurchasesPage from './pages/MaterialPurchasesPage';
import MaterialExpensesPage from './pages/MaterialExpensesPage';
import MaterialExpenseDetail from './pages/MaterialExpenseDetail';
import MaterialPurchaseDetail from './pages/MaterialPurchaseDetail';
import Resources from './pages/Resources';
import Attendance from './pages/Attendance';
import UserManagement from '@/pages/UserManagement';
import Settings from '@/pages/Settings';
import Approvals from '@/pages/Approvals';
import UICustomization from '@/pages/UICustomization';
import NotFound from '@/pages/NotFound';
import { Http } from '@capacitor-community/http';
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/projects" element={
                  <ProtectedRoute>
                    <Layout>
                      <Projects />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/projects/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectDetails />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/companies" element={
                  <ProtectedRoute>
                    <Layout>
                      <Companies />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/companies/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <CompanyDetails />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/finances" element={
                  <ProtectedRoute>
                    <Layout>
                      <Finances />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/materials" element={
                  <ProtectedRoute>
                    <Layout>
                      <Materials />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-requests" element={
                  <ProtectedRoute>
                    <Layout>
                      <MaterialRequests />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-purchases" element={
                  <ProtectedRoute>
                    <Layout>
                      <MaterialPurchases />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-expenses" element={
                  <ProtectedRoute>
                    <Layout>
                      <MaterialExpenses />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-requests-page" element={
                  <ProtectedRoute>
                    <Layout>
                      <MaterialRequestsPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-purchases-page" element={
                  <ProtectedRoute>
                    <Layout>
                      <MaterialPurchasesPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-expenses-page" element={
                  <ProtectedRoute>
                    <Layout>
                      <MaterialExpensesPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-expense/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <MaterialExpenseDetail />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-purchase/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <MaterialPurchaseDetail />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/resources" element={
                  <ProtectedRoute>
                    <Layout>
                      <Resources />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/attendance" element={
                  <ProtectedRoute>
                    <Layout>
                      <Attendance />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute>
                    <Layout>
                      <UserManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ui-customization" element={
                  <ProtectedRoute>
                    <Layout>
                      <UICustomization />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/approvals" element={
                  <ProtectedRoute>
                    <Layout>
                      <Approvals />
                    </Layout>
                  </ProtectedRoute>
                } />
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
