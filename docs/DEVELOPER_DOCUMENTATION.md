
# Business Management System - Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [UI Customization](#ui-customization)
5. [API Integration](#api-integration)
6. [Component Development](#component-development)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

## Project Overview

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Shadcn/UI, Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Mobile**: Capacitor (iOS/Android)
- **Backend**: Node.js, Express, MongoDB

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn)
│   ├── forms/          # Form components
│   └── Layout.tsx      # Main layout wrapper
├── pages/              # Page components
├── hooks/              # Custom React hooks
│   └── api/           # API-specific hooks
├── services/           # API service layer
│   └── api/           # API client and services
├── utils/              # Utility functions
├── data/               # Type definitions and constants
└── config/             # Configuration files
```

## Frontend Architecture

### Component Architecture
The application follows a modular component architecture:

#### Base Components (`src/components/ui/`)
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Fully accessible and customizable

#### Page Components (`src/pages/`)
- Route-level components
- Handle data fetching and state management
- Compose smaller components

#### Form Components (`src/components/forms/`)
- Reusable form implementations
- Built with React Hook Form and Zod validation
- Consistent styling and behavior

### State Management
Uses TanStack Query for server state management:

```typescript
// Example API hook
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getCompanies,
  });
};
```

### Routing
React Router DOM with protected routes:

```typescript
// Protected route wrapper
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Layout>
      <Dashboard />
    </Layout>
  </ProtectedRoute>
} />
```

## Backend Architecture

### API Structure
Base URL: `https://sgen.quarksense.in/api`

#### Authentication
- JWT-based authentication
- Role-based access control (admin, manager, user)
- Token expires in 30 days

#### Endpoints Overview
- `/auth` - Authentication and registration
- `/companies` - Company management
- `/projects` - Project management
- `/finances` - Financial transactions
- `/users` - User management

### Database Schema
MongoDB collections:
- `users` - User accounts and profiles
- `companies` - Company information
- `projects` - Project data with embedded resources
- `transactions` - Financial transactions
- `attendance` - Attendance records

### API Integration

#### Service Layer (`src/services/api/`)
```typescript
// Example service
export const companyService = {
  async getCompanies(): Promise<Company[]> {
    const response = await apiClient.get('/companies');
    return response.data;
  },
  
  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await apiClient.post('/companies', data);
    return response.data;
  }
};
```

#### Error Handling
```typescript
// API client with interceptors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## UI Customization

### Theme System
The application supports extensive UI customization:

#### Using the UI Customization Page
1. Navigate to `/ui-customization`
2. Modify branding, colors, layout settings
3. Changes are saved to localStorage and applied globally

#### Custom CSS Variables
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #f1f5f9;
  --accent-color: #10b981;
  --sidebar-width: 256px;
  --header-height: 64px;
  --card-radius: 8px;
}
```

#### Creating Custom Components
```typescript
// Example custom component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CustomCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const CustomCard = ({ title, children, className }: CustomCardProps) => {
  return (
    <Card className={cn('custom-card-style', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
```

### Layout Customization
Modify `src/components/Layout.tsx` for structural changes:

```typescript
// Custom layout modifications
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { layoutSettings } = useUISettings();
  
  return (
    <div 
      className="min-h-screen bg-background"
      style={{ '--sidebar-width': layoutSettings.sidebarWidth }}
    >
      {/* Layout implementation */}
    </div>
  );
};
```

## API Hooks Development

### Creating New API Hooks
Follow the established pattern for consistency:

```typescript
// 1. Create service function
export const newEntityService = {
  async getEntities(): Promise<Entity[]> {
    const response = await apiClient.get('/entities');
    return response.data;
  },
  
  async createEntity(data: CreateEntityData): Promise<Entity> {
    const response = await apiClient.post('/entities', data);
    return response.data;
  }
};

// 2. Create hook
export const useEntities = () => {
  return useQuery({
    queryKey: ['entities'],
    queryFn: newEntityService.getEntities,
  });
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: newEntityService.createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });
};
```

### Query Invalidation Strategy
- Invalidate related queries after mutations
- Use specific query keys for targeted updates
- Consider optimistic updates for better UX

## Component Development

### Form Components
Use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export const CustomForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data: FormData) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### Page Components
Structure page components consistently:

```typescript
export const NewPage = () => {
  // 1. API hooks
  const { data, isLoading, error } = useEntities();
  const createEntity = useCreateEntity();
  
  // 2. Local state
  const [selectedItem, setSelectedItem] = useState(null);
  
  // 3. Event handlers
  const handleCreate = (data: CreateEntityData) => {
    createEntity.mutate(data);
  };
  
  // 4. Early returns for loading/error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // 5. Main render
  return (
    <div className="space-y-6">
      {/* Page content */}
    </div>
  );
};
```

## Deployment Guide

### Frontend Deployment
1. **Build the application**:
   ```bash
   npm run build
   ```

2. **For web deployment**:
   - Deploy `dist/` folder to your hosting service
   - Configure environment variables

3. **For mobile deployment**:
   ```bash
   # Android
   npx cap sync android
   npx cap run android
   
   # iOS
   npx cap sync ios
   npx cap run ios
   ```

### Backend Deployment
1. Set environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/business-management
   JWT_SECRET=your-jwt-secret
   PORT=5000
   ```

2. Start the server:
   ```bash
   npm start
   ```

### Environment Configuration
Update `.env` file for different environments:
```
VITE_API_URL=https://your-api-domain.com/api
```

## Troubleshooting

### Common Issues

#### Network Errors in Mobile App
- Ensure HTTPS is used for production APIs
- Check CORS configuration on backend
- Verify Capacitor configuration

#### Authentication Issues
- Check JWT token expiration
- Verify API client interceptors
- Ensure proper error handling

#### Build Errors
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify import paths

#### Styling Issues
- Check Tailwind CSS configuration
- Verify CSS variable usage
- Ensure proper class names

### Development Tools
- **React DevTools**: Debug component state
- **TanStack Query DevTools**: Monitor API state
- **Browser DevTools**: Network and console debugging

### Performance Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Optimize images and assets
- Use code splitting for large bundles

## Contributing

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Git Workflow
1. Create feature branches from main
2. Write descriptive commit messages
3. Create pull requests for review
4. Ensure all tests pass before merging

### Testing Guidelines
- Write unit tests for utility functions
- Test API hooks with mock data
- Use React Testing Library for component tests
- Ensure responsive design works on all devices

---

For additional support or questions, refer to the project's issue tracker or contact the development team.
