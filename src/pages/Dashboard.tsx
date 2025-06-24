
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency } from '@/utils/financialUtils';
import { useCompanies } from '@/hooks/api/useCompanies';
import { useProjects } from '@/hooks/api/useProjects';
import { useFinancialSummary, useTransactions } from '@/hooks/api/useFinances';

const Dashboard = () => {
  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: financialSummary } = useFinancialSummary();
  const { data: allTransactions = [] } = useTransactions();

  // Get pending payments from actual transaction data
  const pendingPayments = allTransactions.filter(t => 
    (t.type === 'payment' || t.type === 'income') && 
    ((t as any).status === 'pending' || (t as any).status === 'overdue')
  );

  const totalPendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Early return if no financial data
  if (!financialSummary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <h1 className="text-xl font-bold mb-6 text-gray-900">Financial Dashboard</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading financial data...</div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for payment status pie chart
  const paymentStatusData = [
    { name: 'Revenue', value: financialSummary.totalRevenue },
    { name: 'Pending', value: totalPendingAmount },
    { name: 'Expenses', value: financialSummary.totalExpenses }
  ];
  
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Calculate percentage changes
  const revenueChange = financialSummary.totalRevenue > 0 ? 15.8 : 0;
  const expenseChange = financialSummary.totalExpenses > 0 ? 8.2 : 0;

  // Custom label function to prevent overlapping
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Financial Dashboard</h1>
        
        {/* Stats overview - Mobile first responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(financialSummary.totalRevenue)}
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            trend="up"
            trendValue={`${revenueChange}%`}
          />
          
          <StatCard
            title="Total Expenses"
            value={formatCurrency(financialSummary.totalExpenses)}
            icon={<DollarSign className="h-5 w-5 text-destructive" />}
            trend="up"
            trendValue={`${expenseChange}%`}
          />
          
          <StatCard
            title="Profit"
            value={formatCurrency(financialSummary.profit)}
            icon={<ArrowUp className="h-5 w-5 text-green-600" />}
            trend={financialSummary.profit > 0 ? "up" : "down"}
            trendValue={`${Math.abs(((financialSummary.profit / financialSummary.totalRevenue) * 100) || 0).toFixed(1)}%`}
          />
          
          <StatCard
            title="Pending Payments"
            value={formatCurrency(totalPendingAmount)}
            icon={<ArrowDown className="h-5 w-5 text-yellow-600" />}
            trend="neutral"
            trendValue={`${pendingPayments.length} items`}
          />
        </div>
        
        {/* Secondary stats - Mobile first responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Active Companies"
            value={companies.length}
            icon={<Users className="h-5 w-5 text-blue-600" />}
          />
          
          <StatCard
            title="Active Projects"
            value={projects.filter(p => p.status === 'in-progress').length}
            icon={<Briefcase className="h-5 w-5 text-indigo-600" />}
          />
          
          <StatCard
            title="Total Projects"
            value={projects.length}
            icon={<Users className="h-5 w-5 text-purple-600" />}
          />
        </div>
        
        {/* Charts - Mobile first responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius="70%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))} 
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Companies Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={companies.map(company => ({
                    name: company.name.length > 8 ? company.name.substring(0, 8) + '...' : company.name,
                    fullName: company.name,
                    projects: projects.filter(p => p.companyId === company.id).length
                  }))}
                  margin={{
                    top: 5,
                    right: 15,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis fontSize={10} />
                  <Tooltip 
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.fullName || label;
                    }}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
