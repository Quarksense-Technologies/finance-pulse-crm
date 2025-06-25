
import type { Story } from "@ladle/react";
import StatusBadge from "./StatusBadge";

export const Default: Story = () => <StatusBadge status="active" />;

export const AllStatuses: Story = () => (
  <div className="flex flex-wrap gap-2">
    <StatusBadge status="active" />
    <StatusBadge status="completed" />
    <StatusBadge status="on-hold" />
    <StatusBadge status="pending" />
    <StatusBadge status="paid" />
    <StatusBadge status="overdue" />
    <StatusBadge status="materials" />
    <StatusBadge status="manpower" />
    <StatusBadge status="services" />
    <StatusBadge status="other" />
  </div>
);

export const CustomColor: Story = () => (
  <StatusBadge 
    status="custom" 
    colorClassName="bg-purple-100 text-purple-800" 
  />
);

Default.meta = {
  title: "UI/StatusBadge",
};
