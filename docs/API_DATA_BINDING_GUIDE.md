
# API Data Binding Guide for Android Development

## Overview
This guide explains how to bind data received from the Business Management System API to your Android application UI components.

## 1. Data Models and Types

### 1.1 Response Structure
All API responses follow this general structure:
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

### 1.2 Data Types Mapping

#### User Object
```json
{
  "_id": "60d5ecb54b24a03a8c8b4567",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "manager",
  "profileImage": "https://example.com/profile.jpg",
  "theme": "light",
  "createdAt": "2023-06-25T10:30:00Z"
}
```

**FlutterFlow Binding:**
- Display Name: `item.name`
- Display Email: `item.email`
- Display Role: `item.role`
- Profile Image: `item.profileImage`

#### Company Object
```json
{
  "_id": "60d5ecb54b24a03a8c8b4568",
  "name": "Acme Corporation",
  "description": "Leading technology company",
  "logo": "https://example.com/logo.png",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "contactInfo": {
    "email": "contact@acme.com",
    "phone": "1234567890",
    "website": "www.acme.com"
  },
  "managers": ["60d5ecb54b24a03a8c8b4567"],
  "projects": [...],
  "createdAt": "2023-06-25T10:30:00Z"
}
```

**FlutterFlow Binding:**
- Company Name: `item.name`
- Description: `item.description`
- Logo: `item.logo`
- Contact Email: `item.contactInfo.email`
- Phone: `item.contactInfo.phone`
- Address: `${item.address.street}, ${item.address.city}`

#### Project Object
```json
{
  "_id": "60d5ecb54b24a03a8c8b4569",
  "name": "Website Redesign",
  "description": "Complete website redesign project",
  "companyId": "60d5ecb54b24a03a8c8b4568",
  "companyName": "Acme Corporation",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-06-30T00:00:00Z",
  "status": "in-progress",
  "budget": 50000,
  "managers": ["60d5ecb54b24a03a8c8b4567"],
  "team": ["60d5ecb54b24a03a8c8b456a"],
  "totalPayments": 25000,
  "totalExpenses": 15000,
  "profit": 10000,
  "createdAt": "2023-06-25T10:30:00Z"
}
```

**FlutterFlow Binding:**
- Project Name: `item.name`
- Company: `item.companyName`
- Status: `item.status`
- Budget: `item.budget.formatCurrency()`
- Progress: Calculate based on dates
- Profit: `item.profit.formatCurrency()`

#### Transaction Object
```json
{
  "_id": "60d5ecb54b24a03a8c8b456b",
  "type": "expense",
  "amount": 1500,
  "description": "Office supplies purchase",
  "category": "office",
  "project": "60d5ecb54b24a03a8c8b4569",
  "date": "2025-01-15T00:00:00Z",
  "status": "pending",
  "attachments": [
    {
      "name": "Invoice.pdf",
      "url": "https://example.com/invoice.pdf"
    }
  ],
  "createdBy": "60d5ecb54b24a03a8c8b4567",
  "createdAt": "2023-06-25T10:30:00Z"
}
```

**FlutterFlow Binding:**
- Amount: `item.amount.formatCurrency()`
- Description: `item.description`
- Category: `item.category.capitalize()`
- Date: `item.date.formatDate()`
- Status: `item.status`

## 2. List View Data Binding

### 2.1 Companies ListView
```dart
// Data Source: FFAppState().companies
// Item Type: Dynamic

// For each list item:
Text(item['name'] ?? 'Unknown Company')  // Company name
Text(item['description'] ?? '')          // Description
Image.network(item['logo'] ?? '')        // Logo
Text(item['contactInfo']['email'] ?? '') // Email
```

### 2.2 Projects ListView
```dart
// Data Source: FFAppState().projects
// Filter by company: projects.where((p) => p['companyId'] == selectedCompanyId)

// For each project item:
Text(item['name'] ?? 'Unknown Project')           // Project name
Text(item['companyName'] ?? '')                   // Company name
Container(                                        // Status badge
  color: getStatusColor(item['status']),
  child: Text(item['status']?.toUpperCase() ?? 'UNKNOWN')
)
Text('Budget: \$${item['budget']?.toString() ?? '0'}') // Budget
LinearProgressIndicator(                          // Progress bar
  value: calculateProgress(item['startDate'], item['endDate'])
)
```

### 2.3 Transactions ListView
```dart
// Data Source: FFAppState().transactions
// Filter by project: transactions.where((t) => t['project'] == selectedProjectId)

// For each transaction:
Row(
  children: [
    Icon(getTransactionIcon(item['type'])),       // Type icon
    Column(
      children: [
        Text(item['description'] ?? ''),           // Description
        Text(item['category']?.capitalize() ?? ''), // Category
        Text(formatDate(item['date'])),            // Date
      ]
    ),
    Column(
      children: [
        Text('\$${item['amount']?.toString() ?? '0'}'), // Amount
        Container(                                 // Status badge
          color: getStatusColor(item['status']),
          child: Text(item['status']?.toUpperCase() ?? '')
        )
      ]
    )
  ]
)
```

## 3. Form Data Binding

### 3.1 Company Form
```dart
// Form fields binding:
TextFormField(
  controller: nameController,
  decoration: InputDecoration(labelText: 'Company Name'),
  validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
)

TextFormField(
  controller: descriptionController,
  decoration: InputDecoration(labelText: 'Description'),
  maxLines: 3,
)

TextFormField(
  controller: emailController,
  decoration: InputDecoration(labelText: 'Contact Email'),
  keyboardType: TextInputType.emailAddress,
)

// On form submit:
final companyData = {
  'name': nameController.text,
  'description': descriptionController.text,
  'contactInfo': {
    'email': emailController.text,
    'phone': phoneController.text,
    'website': websiteController.text,
  }
};
```

### 3.2 Project Form
```dart
DropdownButtonFormField<String>(
  value: selectedCompanyId,
  decoration: InputDecoration(labelText: 'Company'),
  items: FFAppState().companies.map<DropdownMenuItem<String>>((company) {
    return DropdownMenuItem<String>(
      value: company['_id'],
      child: Text(company['name'] ?? ''),
    );
  }).toList(),
  onChanged: (value) => setState(() => selectedCompanyId = value),
)

DropdownButtonFormField<String>(
  value: selectedStatus,
  decoration: InputDecoration(labelText: 'Status'),
  items: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled']
    .map<DropdownMenuItem<String>>((status) {
      return DropdownMenuItem<String>(
        value: status,
        child: Text(status.capitalize()),
      );
    }).toList(),
  onChanged: (value) => setState(() => selectedStatus = value),
)
```

### 3.3 Transaction Form
```dart
DropdownButtonFormField<String>(
  value: selectedType,
  decoration: InputDecoration(labelText: 'Type'),
  items: ['expense', 'payment', 'income']
    .map<DropdownMenuItem<String>>((type) {
      return DropdownMenuItem<String>(
        value: type,
        child: Text(type.capitalize()),
      );
    }).toList(),
  onChanged: (value) => setState(() => selectedType = value),
)

TextFormField(
  controller: amountController,
  decoration: InputDecoration(
    labelText: 'Amount',
    prefixText: '\$',
  ),
  keyboardType: TextInputType.numberWithOptions(decimal: true),
  validator: (value) {
    if (value?.isEmpty ?? true) return 'Required';
    if (double.tryParse(value!) == null) return 'Invalid amount';
    return null;
  },
)
```

## 4. Conditional Display

### 4.1 Status-based Styling
```dart
Color getStatusColor(String? status) {
  switch (status?.toLowerCase()) {
    case 'planning': return Colors.blue;
    case 'in-progress': return Colors.orange;
    case 'on-hold': return Colors.yellow;
    case 'completed': return Colors.green;
    case 'cancelled': return Colors.red;
    case 'pending': return Colors.orange;
    case 'approved': return Colors.green;
    case 'rejected': return Colors.red;
    default: return Colors.grey;
  }
}

IconData getTransactionIcon(String? type) {
  switch (type?.toLowerCase()) {
    case 'expense': return Icons.remove_circle;
    case 'payment': return Icons.add_circle;
    case 'income': return Icons.attach_money;
    default: return Icons.help;
  }
}
```

### 4.2 Role-based Visibility
```dart
// Show/hide based on user role
if (FFAppState().currentUser['role'] == 'admin' || 
    FFAppState().currentUser['role'] == 'manager') {
  // Show admin/manager features
  FloatingActionButton(
    onPressed: () => createNewCompany(),
    child: Icon(Icons.add),
  )
}

// Conditional actions
PopupMenuButton<String>(
  itemBuilder: (context) => [
    PopupMenuItem(value: 'edit', child: Text('Edit')),
    if (FFAppState().currentUser['role'] == 'admin')
      PopupMenuItem(value: 'delete', child: Text('Delete')),
  ],
)
```

## 5. Data Formatting Utilities

### 5.1 Date Formatting
```dart
String formatDate(String? dateString) {
  if (dateString == null) return '';
  try {
    final date = DateTime.parse(dateString);
    return DateFormat('MMM dd, yyyy').format(date);
  } catch (e) {
    return dateString;
  }
}

String formatDateTime(String? dateString) {
  if (dateString == null) return '';
  try {
    final date = DateTime.parse(dateString);
    return DateFormat('MMM dd, yyyy HH:mm').format(date);
  } catch (e) {
    return dateString;
  }
}
```

### 5.2 Currency Formatting
```dart
String formatCurrency(dynamic amount) {
  if (amount == null) return '\$0.00';
  
  try {
    final number = double.parse(amount.toString());
    return NumberFormat.currency(symbol: '\$').format(number);
  } catch (e) {
    return '\$0.00';
  }
}
```

### 5.3 String Utilities
```dart
extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  }
  
  String truncate(int maxLength) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}...';
  }
}
```

## 6. Error Handling in UI

### 6.1 Loading States
```dart
// Show loading indicator
if (FFAppState().isLoading) {
  return Center(child: CircularProgressIndicator());
}

// Show data or empty state
if (FFAppState().companies.isEmpty) {
  return Center(
    child: Column(
      children: [
        Icon(Icons.business, size: 64, color: Colors.grey),
        Text('No companies found'),
        ElevatedButton(
          onPressed: () => fetchCompanies(),
          child: Text('Retry'),
        ),
      ],
    ),
  );
}
```

### 6.2 Error Display
```dart
// Show error message
if (FFAppState().errorMessage.isNotEmpty) {
  return Container(
    padding: EdgeInsets.all(16),
    color: Colors.red[100],
    child: Row(
      children: [
        Icon(Icons.error, color: Colors.red),
        SizedBox(width: 8),
        Expanded(child: Text(FFAppState().errorMessage)),
        IconButton(
          onPressed: () => FFAppState().errorMessage = '',
          icon: Icon(Icons.close),
        ),
      ],
    ),
  );
}
```

## 7. Real-time Data Updates

### 7.1 Pull-to-Refresh
```dart
RefreshIndicator(
  onRefresh: () async {
    await fetchCompanies();
    await fetchProjects();
  },
  child: ListView.builder(
    itemCount: FFAppState().companies.length,
    itemBuilder: (context, index) {
      final company = FFAppState().companies[index];
      return CompanyListItem(company: company);
    },
  ),
)
```

### 7.2 Auto-refresh
```dart
@override
void initState() {
  super.initState();
  
  // Initial load
  fetchData();
  
  // Auto-refresh every 5 minutes
  Timer.periodic(Duration(minutes: 5), (timer) {
    if (mounted) fetchData();
  });
}
```

This guide provides comprehensive instructions for binding API data to your Android application UI components, ensuring proper data display, formatting, and user experience.
