import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { initializeData, calculateFinancialSummary, calculateManpowerSummary } from '@/data/mockData';
import { companies, projects, payments, expenses } from '@/data/mockData';
import { formatCurrency } from '@/utils/financialUtils';

const Dashboard = () => {
  const [financialSummary, setFinancialSummary] = useState(calculateFinancialSummary());
  const [manpowerSummary, setManpowerSummary] = useState(calculateManpowerSummary());

  useEffect(() => {
    // Initialize data relationships
    initializeData();
    
    // Recalculate summaries
    setFinancialSummary(calculateFinancialSummary());
    setManpowerSummary(calculateManpowerSummary());
  }, []);

  // Prepare data for payment status pie chart
  const paymentStatusData = [
    { name: 'Paid', value: financialSummary.totalRevenue },
    { name: 'Pending', value: financialSummary.pendingPayments },
    { name: 'Overdue', value: financialSummary.overduePayments }
  ];
  
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Prepare data for monthly revenue and expenses bar chart
  // Group payments and expenses by month
  const getMonthlyData = () => {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const monthlyData = months.map(month => {
      return {
        name: month,
        revenue: 0,
        expenses: 0
      };
    });
    
    // Add revenue data
    payments.forEach(payment => {
      const date = new Date(payment.date);
      const monthIndex = date.getMonth();
      
      if (monthIndex < 6 && payment.status === 'paid') {
        monthlyData[monthIndex].revenue += payment.amount;
      }
    });
    
    // Add expense data
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthIndex = date.getMonth();
      
      if (monthIndex < 6) {
        monthlyData[monthIndex].expenses += expense.amount;
      }
    });
    
    return monthlyData;
  };

  const monthlyData = getMonthlyData();

  // Calculate percentage changes
  const revenueChange = financialSummary.totalRevenue > 0 ? 15.8 : 0; // Mock percentage change
  const expenseChange = financialSummary.totalExpenses > 0 ? 8.2 : 0; // Mock percentage change

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Financial Dashboard</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(financialSummary.totalRevenue)}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          trend="up"
          trendValue={`${revenueChange}%`}
        />
        
        <StatCard
          title="Total Expenses"
          value={formatCurrency(financialSummary.totalExpenses)}
          icon={<DollarSign className="h-6 w-6 text-destructive" />}
          trend="up"
          trendValue={`${expenseChange}%`}
        />
        
        <StatCard
          title="Profit"
          value={formatCurrency(financialSummary.profit)}
          icon={<ArrowUp className="h-6 w-6 text-green-600" />}
          trend={financialSummary.profit > 0 ? "up" : "down"}
          trendValue={`${Math.abs(((financialSummary.profit / financialSummary.totalRevenue) * 100) || 0).toFixed(1)}%`}
        />
        
        <StatCard
          title="Pending Payments"
          value={formatCurrency(financialSummary.pendingPayments + financialSummary.overduePayments)}
          icon={<ArrowDown className="h-6 w-6 text-yellow-600" />}
          trend="neutral"
          trendValue={`${((financialSummary.pendingPayments + financialSummary.overduePayments) / 
            (financialSummary.totalRevenue + financialSummary.pendingPayments + financialSummary.overduePayments) * 100).toFixed(1)}%`}
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
          value={projects.filter(p => p.status === 'active' || p.status === 'in-progress').length}
          icon={<Briefcase className="h-6 w-6 text-indigo-600" />}
        />
        
        <StatCard
          title="Total Manpower Allocated"
          value={`${manpowerSummary.totalAllocated} hrs`}
          icon={<Users className="h-6 w-6 text-purple-600" />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
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
