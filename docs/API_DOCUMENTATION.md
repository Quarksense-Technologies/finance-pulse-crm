
# Business Management System API Documentation

## Base URL
```
https://sgen.quarksense.in/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Responses
All endpoints return appropriate HTTP status codes with error messages:
```json
{
  "message": "Error description"
}
```

## Authentication Endpoints

### Login
**POST** `/auth/login`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "user|manager|admin",
  "token": "jwt_token"
}
```

### Register
**POST** `/auth/register` (Admin only)

Request Body:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

## Company Endpoints

### Get All Companies
**GET** `/companies`

Response: Array of companies with basic info

### Get Company by ID
**GET** `/companies/:id`

Response: Detailed company info including associated projects

### Create Company
**POST** `/companies` (Admin/Manager)

Request Body:
```json
{
  "name": "Company Name",
  "description": "Company Description",
  "logo": "logo_url",
  "address": {
    "street": "123 Street",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "contactInfo": {
    "email": "contact@company.com",
    "phone": "1234567890",
    "website": "www.company.com"
  },
  "managers": ["manager_id_1", "manager_id_2"]
}
```

### Update Company
**PUT** `/companies/:id` (Admin/Manager)

Request Body: Same as Create Company (all fields optional)

### Delete Company
**DELETE** `/companies/:id` (Admin only)

## Project Endpoints

### Get All Projects
**GET** `/projects`

Query Parameters:
- `company`: Filter by company ID
- `status`: Filter by status

### Get Project by ID
**GET** `/projects/:id`

### Create Project
**POST** `/projects` (Admin/Manager)

Request Body:
```json
{
  "name": "Project Name",
  "description": "Project Description",
  "company": "company_id",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "status": "planning|in-progress|on-hold|completed|cancelled",
  "budget": 50000,
  "managers": ["manager_id_1"],
  "team": ["user_id_1", "user_id_2"]
}
```

### Update Project
**PUT** `/projects/:id` (Admin/Manager)

### Delete Project
**DELETE** `/projects/:id` (Admin only)

## Finance Endpoints

### Get All Transactions
**GET** `/finances`

Query Parameters:
- `project`: Filter by project ID
- `company`: Filter by company ID
- `type`: Filter by transaction type
- `status`: Filter by status
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end

### Create Transaction
**POST** `/finances`

Request Body:
```json
{
  "type": "expense|payment|income",
  "amount": 1000,
  "description": "Transaction description",
  "category": "salary|equipment|software|consulting|office|travel|marketing|utilities|taxes|other",
  "project": "project_id",
  "date": "2025-01-15",
  "attachments": [
    {
      "name": "Invoice",
      "url": "attachment_url"
    }
  ]
}
```

### Approve Transaction
**PUT** `/finances/:id/approve` (Admin/Manager)

### Reject Transaction
**PUT** `/finances/:id/reject` (Admin/Manager)

Request Body:
```json
{
  "reason": "Rejection reason"
}
```

### Get Financial Summary
**GET** `/finances/summary`

Query Parameters:
- `startDate`: Start date for summary
- `endDate`: End date for summary
- `company`: Filter by company ID
- `project`: Filter by project ID

## User Endpoints

### Get All Users
**GET** `/users` (Admin only)

### Get User by ID
**GET** `/users/:id`

### Create User
**POST** `/users` (Admin only)

Request Body:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "user|manager|admin"
}
```

### Update User Profile
**PUT** `/users/profile/update`

Request Body:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "theme": "light|dark",
  "profileImage": "image_url"
}
```

## Frontend Integration Examples

### Using with React Query
```typescript
// Get companies
const { data: companies, isLoading } = useQuery({
  queryKey: ['companies'],
  queryFn: () => companyService.getCompanies(),
});

// Create company
const createCompany = useMutation({
  mutationFn: companyService.createCompany,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['companies'] });
  },
});
```

### Error Handling
```typescript
const { data, error } = useQuery({
  queryKey: ['companies'],
  queryFn: companyService.getCompanies,
  onError: (error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
});
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## Webhook Support
Available for:
- Transaction status changes
- Project completion
- Payment notifications

Configure webhooks in the admin panel or via API.
