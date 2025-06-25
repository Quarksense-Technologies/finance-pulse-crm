
import type { Story } from "@ladle/react";
import { Button } from "./button";
import { Download, Plus, Trash2 } from "lucide-react";

export const Default: Story = () => <Button>Default Button</Button>;

export const Variants: Story = () => (
  <div className="flex flex-wrap gap-2">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
);

export const Sizes: Story = () => (
  <div className="flex flex-wrap gap-2 items-center">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">
      <Plus className="h-4 w-4" />
    </Button>
  </div>
);

export const WithIcons: Story = () => (
  <div className="flex flex-wrap gap-2">
    <Button>
      <Download className="mr-2 h-4 w-4" />
      Download
    </Button>
    <Button variant="outline">
      <Plus className="mr-2 h-4 w-4" />
      Add Item
    </Button>
    <Button variant="destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  </div>
);

export const Disabled: Story = () => (
  <div className="flex flex-wrap gap-2">
    <Button disabled>Disabled Default</Button>
    <Button variant="outline" disabled>Disabled Outline</Button>
    <Button variant="destructive" disabled>Disabled Destructive</Button>
  </div>
);

Default.meta = {
  title: "UI/Button",
};
