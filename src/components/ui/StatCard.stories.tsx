
import type { Story } from "@ladle/react";
import StatCard from "./StatCard";
import { DollarSign, Users, Briefcase } from "lucide-react";

export const Default: Story = () => (
  <StatCard
    title="Total Revenue"
    value="$45,231"
    description="From last month"
  />
);

export const WithIcon: Story = () => (
  <StatCard
    title="Total Revenue"
    value="$45,231"
    icon={<DollarSign className="h-6 w-6 text-primary" />}
    description="From last month"
  />
);

export const WithTrend: Story = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard
      title="Revenue"
      value="$45,231"
      icon={<DollarSign className="h-6 w-6 text-primary" />}
      trend="up"
      trendValue="+12%"
      description="From last month"
    />
    <StatCard
      title="Active Users"
      value="2,345"
      icon={<Users className="h-6 w-6 text-primary" />}
      trend="down"
      trendValue="-3%"
      description="From last week"
    />
    <StatCard
      title="Projects"
      value="12"
      icon={<Briefcase className="h-6 w-6 text-primary" />}
      trend="neutral"
      trendValue="0%"
      description="No change"
    />
  </div>
);

Default.meta = {
  title: "UI/StatCard",
};
