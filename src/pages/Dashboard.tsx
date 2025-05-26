
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency } from '@/utils/financialUtils';
import { useCompanies } from '@/hooks/api/useCompanies';
import { useProjects } from '@/hooks/api/useProjects';
import { useFinancialSummary } from '@/hooks/api/useFinances';

const Dashboard = () => {
  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: financialSummary } = useFinancialSummary();

  // Mock data for now since we don't have payment/expense endpoints yet
  const mockFinancialSummary = {
    totalRevenue: 125000,
    totalExpenses: 85000,
    profit: 40000,
    pendingPayments: 15000,
    overduePayments: 5000
  };

  const summary = financialSummary || mockFinancialSummary;

  // Prepare data for payment status pie chart
  const paymentStatusData = [
    { name: 'Revenue', value: summary.totalRevenue },
    { name: 'Pending', value: summary.pendingPayments },
    { name: 'Overdue', value: summary.overduePayments }
  ];
  
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Prepare data for monthly revenue and expenses bar chart
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    // Mock monthly data - in real implementation this would come from API
    const monthlyData = months.map((month, index) => ({
      name: month,
      revenue: Math.floor(Math.random() * 20000) + 10000,
      expenses: Math.floor(Math.random() * 15000) + 8000
    }));
    
    return monthlyData;
  };

  const monthlyData = getMonthlyData();

  // Calculate percentage changes
  const revenueChange = summary.totalRevenue > 0 ? 15.8 : 0;
  const expenseChange = summary.totalExpenses > 0 ? 8.2 : 0;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Financial Dashboard</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          trend="up"
          trendValue={`${revenueChange}%`}
        />
        
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={<DollarSign className="h-6 w-6 text-destructive" />}
          trend="up"
          trendValue={`${expenseChange}%`}
        />
        
        <StatCard
          title="Profit"
          value={formatCurrency(summary.profit)}
          icon={<ArrowUp className="h-6 w-6 text-green-600" />}
          trend={summary.profit > 0 ? "up" : "down"}
          trendValue={`${Math.abs(((summary.profit / summary.totalRevenue) * 100) || 0).toFixed(1)}%`}
        />
        
        <StatCard
          title="Pending Payments"
          value={formatCurrency(summary.pendingPayments + summary.overduePayments)}
          icon={<ArrowDown className="h-6 w-6 text-yellow-600" />}
          trend="neutral"
          trendValue={`${((summary.pendingPayments + summary.overduePayments) / 
            (summary.totalRevenue + summary.pendingPayments + summary.overduePayments) * 100).toFixed(1)}%`}
        />
      </div>
      
      {/* Secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Active Companies"
          value={companies.length}
          icon={<Users className="h-6 w-6 text-blue-600" />}
        />
        
        <StatCard
          title="Active Projects"
          value={projects.filter(p => p.status === 'in-progress').length}
          icon={<Briefcase className="h-6 w-6 text-indigo-600" />}
        />
        
        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={<Users className="h-6 w-6 text-purple-600" />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue vs Expenses</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
