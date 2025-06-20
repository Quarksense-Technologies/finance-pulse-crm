
# UI Components Documentation

## Overview
This document provides comprehensive information about the UI components available in the Business Management System.

## Base Components (Shadcn/UI)

### Button
```typescript
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Card
```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Card footer content
  </CardFooter>
</Card>
```

### Form Components
```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Input
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email" />
</div>

// Textarea
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea id="description" placeholder="Enter description" />
</div>

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Dialog
```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    Dialog content goes here
  </DialogContent>
</Dialog>
```

### Alert Dialog
```typescript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Custom Components

### StatusBadge
```typescript
import StatusBadge from '@/components/ui/StatusBadge';

<StatusBadge status="active" />
<StatusBadge status="completed" />
<StatusBadge status="pending" />
```

### StatCard
```typescript
import StatCard from '@/components/ui/StatCard';
import { Users } from 'lucide-react';

<StatCard
  title="Total Users"
  value="1,234"
  icon={<Users className="h-6 w-6 text-blue-500" />}
  description="Active users in the system"
  trend="up"
  trendValue="+12%"
/>
```

## Layout Components

### Layout
The main layout wrapper that includes navigation and sidebar:
```typescript
import Layout from '@/components/Layout';

<Layout>
  <YourPageContent />
</Layout>
```

### ProtectedRoute
Wrapper for routes that require authentication:
```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

<ProtectedRoute>
  <PrivateComponent />
</ProtectedRoute>
```

## Form Components

### CompanyForm
```typescript
import CompanyForm from '@/components/forms/CompanyForm';

<CompanyForm
  onSubmit={(data) => handleSubmit(data)}
  initialData={existingCompany} // Optional for editing
/>
```

### ProjectForm
```typescript
import ProjectForm from '@/components/forms/ProjectForm';

<ProjectForm
  onSubmit={(data) => handleSubmit(data)}
  companies={companiesData}
  initialData={existingProject} // Optional for editing
/>
```

### ExpenseForm
```typescript
import ExpenseForm from '@/components/forms/ExpenseForm';

<ExpenseForm
  onSubmit={(data) => handleSubmit(data)}
  projects={projectsData}
/>
```

### PaymentForm
```typescript
import PaymentForm from '@/components/forms/PaymentForm';

<PaymentForm
  onSubmit={(data) => handleSubmit(data)}
  projects={projectsData}
/>
```

## Customization

### Theming
The application uses CSS variables for theming:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

### Custom Styling
Use Tailwind CSS classes for styling:
```typescript
<Card className="shadow-lg border-2 border-blue-200">
  <CardContent className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
    Custom styled card content
  </CardContent>
</Card>
```

### Responsive Design
All components are responsive by default. Use responsive classes:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

## Animation Classes

### Available Animations
```css
/* Fade animations */
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-fade-out { animation: fade-out 0.3s ease-out; }

/* Scale animations */
.animate-scale-in { animation: scale-in 0.2s ease-out; }
.animate-scale-out { animation: scale-out 0.2s ease-out; }

/* Slide animations */
.animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
.animate-slide-out-right { animation: slide-out-right 0.3s ease-out; }

/* Hover effects */
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.05); }

/* Interactive elements */
.story-link { /* Animated underline effect */ }
```

### Usage
```typescript
<div className="animate-fade-in">
  Content with fade-in animation
</div>

<button className="hover-scale">
  Button with hover scale effect
</button>
```

## Icons

### Lucide React Icons
```typescript
import { Home, User, Settings, Plus, Edit, Trash2 } from 'lucide-react';

<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

### Icon Sizes
Common icon size classes:
- `h-3 w-3` - Extra small (12px)
- `h-4 w-4` - Small (16px)
- `h-5 w-5` - Medium (20px)
- `h-6 w-6` - Large (24px)
- `h-8 w-8` - Extra large (32px)

## Accessibility

### ARIA Labels
```typescript
<Button aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>
```

### Keyboard Navigation
All interactive components support keyboard navigation:
- Tab/Shift+Tab for focus navigation
- Enter/Space for activation
- Escape for closing dialogs/dropdowns

### Screen Reader Support
Components include proper ARIA attributes and semantic HTML.

## Best Practices

### Component Composition
```typescript
// Good: Compose smaller components
const UserCard = ({ user }) => (
  <Card>
    <CardHeader>
      <CardTitle>{user.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <UserDetails user={user} />
      <UserActions user={user} />
    </CardContent>
  </Card>
);

// Avoid: Large monolithic components
```

### Consistent Spacing
Use consistent spacing classes:
- `space-y-2` - Small vertical spacing
- `space-y-4` - Medium vertical spacing
- `space-y-6` - Large vertical spacing
- `gap-2`, `gap-4`, `gap-6` - Grid/flex gaps

### Loading States
```typescript
if (isLoading) {
  return <div className="animate-pulse">Loading...</div>;
}
```

### Error States
```typescript
if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
```
