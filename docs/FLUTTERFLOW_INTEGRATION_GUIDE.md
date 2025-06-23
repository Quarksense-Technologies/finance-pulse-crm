
# FlutterFlow Integration Guide for Business Management System

## Overview
This guide will walk you through integrating the Business Management System API with FlutterFlow step by step.

## Prerequisites
1. FlutterFlow account and project
2. Access to the Business Management System backend API
3. Basic understanding of FlutterFlow interface

## Step 1: Project Setup

### 1.1 Create App Constants
Go to **App Settings > App Constants** and add:
- `API_BASE_URL`: `https://bms.quarksense.in/api`
- `API_TIMEOUT`: `30` (seconds)

### 1.2 Setup App State Variables
Go to **App Settings > App State** and create these variables:

#### Authentication State
- `authToken` (String) - JWT authentication token
- `isLoggedIn` (Boolean) - Login status
- `currentUser` (JSON) - Current user information

#### Data State
- `companies` (List<Dynamic>) - Companies list
- `projects` (List<Dynamic>) - Projects list  
- `transactions` (List<Dynamic>) - Financial transactions
- `selectedCompany` (JSON) - Currently selected company
- `selectedProject` (JSON) - Currently selected project

#### UI State
- `isLoading` (Boolean) - Loading indicator
- `errorMessage` (String) - Error messages

## Step 2: Create Custom Data Types

### 2.1 User Data Type
Go to **App Settings > Custom Data Types** and create:
```
Name: UserType
Fields:
- id (String)
- name (String) 
- email (String)
- role (String)
- profileImage (String)
```

### 2.2 Company Data Type
```
Name: CompanyType
Fields:
- id (String)
- name (String)
- description (String)
- logo (String)
- contactEmail (String)
- contactPhone (String)
- website (String)
```

### 2.3 Project Data Type
```
Name: ProjectType
Fields:
- id (String)
- name (String)
- description (String)
- companyId (String)
- companyName (String)
- status (String)
- startDate (String)
- endDate (String)
- budget (Double)
```

### 2.4 Transaction Data Type
```
Name: TransactionType
Fields:
- id (String)
- type (String)
- amount (Double)
- description (String)
- category (String)
- project (String)
- date (String)
- status (String)
```

## Step 3: Create Custom Actions

### 3.1 Authentication Actions

#### Login Action
Go to **Custom Code > Actions** and create `loginUser`:

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>?> loginUser(
  String email,
  String password,
) async {
  try {
    final response = await http.post(
      Uri.parse('${FFAppConstants.API_BASE_URL}/auth/login'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    ).timeout(Duration(seconds: FFAppConstants.API_TIMEOUT));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      
      // Store in app state
      FFAppState().authToken = data['token'];
      FFAppState().currentUser = data;
      FFAppState().isLoggedIn = true;
      
      return data;
    } else {
      final error = jsonDecode(response.body);
      FFAppState().errorMessage = error['message'] ?? 'Login failed';
      return null;
    }
  } catch (e) {
    FFAppState().errorMessage = 'Network error: $e';
    return null;
  }
}
```

#### Logout Action
Create `logoutUser`:

```dart
Future<void> logoutUser() async {
  FFAppState().authToken = '';
  FFAppState().currentUser = {};
  FFAppState().isLoggedIn = false;
  FFAppState().companies = [];
  FFAppState().projects = [];
  FFAppState().transactions = [];
}
```

### 3.2 Companies Actions

#### Fetch Companies
Create `fetchCompanies`:

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<dynamic>?> fetchCompanies() async {
  if (FFAppState().authToken.isEmpty) return null;
  
  try {
    FFAppState().isLoading = true;
    
    final response = await http.get(
      Uri.parse('${FFAppConstants.API_BASE_URL}/companies'),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
    ).timeout(Duration(seconds: FFAppConstants.API_TIMEOUT));

    if (response.statusCode == 200) {
      final companies = jsonDecode(response.body) as List;
      FFAppState().companies = companies;
      return companies;
    } else if (response.statusCode == 401) {
      // Token expired
      await logoutUser();
      return null;
    } else {
      FFAppState().errorMessage = 'Failed to fetch companies';
      return null;
    }
  } catch (e) {
    FFAppState().errorMessage = 'Network error: $e';
    return null;
  } finally {
    FFAppState().isLoading = false;
  }
}
```

#### Create Company
Create `createCompany`:

```dart
Future<Map<String, dynamic>?> createCompany(
  String name,
  String description,
  String email,
  String phone,
  String website,
) async {
  if (FFAppState().authToken.isEmpty) return null;
  
  try {
    FFAppState().isLoading = true;
    
    final companyData = {
      'name': name,
      'description': description,
      'contactInfo': {
        'email': email,
        'phone': phone,
        'website': website,
      },
    };

    final response = await http.post(
      Uri.parse('${FFAppConstants.API_BASE_URL}/companies'),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(companyData),
    ).timeout(Duration(seconds: FFAppConstants.API_TIMEOUT));

    if (response.statusCode == 201) {
      final newCompany = jsonDecode(response.body);
      
      // Update local state
      List<dynamic> companies = List.from(FFAppState().companies);
      companies.add(newCompany);
      FFAppState().companies = companies;
      
      return newCompany;
    } else {
      final error = jsonDecode(response.body);
      FFAppState().errorMessage = error['message'] ?? 'Failed to create company';
      return null;
    }
  } catch (e) {
    FFAppState().errorMessage = 'Network error: $e';
    return null;
  } finally {
    FFAppState().isLoading = false;
  }
}
```

### 3.3 Projects Actions

#### Fetch Projects
Create `fetchProjects`:

```dart
Future<List<dynamic>?> fetchProjects(String? companyId) async {
  if (FFAppState().authToken.isEmpty) return null;
  
  try {
    FFAppState().isLoading = true;
    
    String url = '${FFAppConstants.API_BASE_URL}/projects';
    if (companyId != null && companyId.isNotEmpty) {
      url += '?company=$companyId';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
    ).timeout(Duration(seconds: FFAppConstants.API_TIMEOUT));

    if (response.statusCode == 200) {
      final projects = jsonDecode(response.body) as List;
      FFAppState().projects = projects;
      return projects;
    } else {
      FFAppState().errorMessage = 'Failed to fetch projects';
      return null;
    }
  } catch (e) {
    FFAppState().errorMessage = 'Network error: $e';
    return null;
  } finally {
    FFAppState().isLoading = false;
  }
}
```

#### Create Project
Create `createProject`:

```dart
Future<Map<String, dynamic>?> createProject(
  String name,
  String description,
  String companyId,
  String startDate,
  String endDate,
  double budget,
  String status,
) async {
  if (FFAppState().authToken.isEmpty) return null;
  
  try {
    FFAppState().isLoading = true;
    
    final projectData = {
      'name': name,
      'description': description,
      'company': companyId,
      'startDate': startDate,
      'endDate': endDate,
      'budget': budget,
      'status': status,
      'managers': [],
      'team': [],
    };

    final response = await http.post(
      Uri.parse('${FFAppConstants.API_BASE_URL}/projects'),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(projectData),
    ).timeout(Duration(seconds: FFAppConstants.API_TIMEOUT));

    if (response.statusCode == 201) {
      final newProject = jsonDecode(response.body);
      
      // Update local state
      List<dynamic> projects = List.from(FFAppState().projects);
      projects.add(newProject);
      FFAppState().projects = projects;
      
      return newProject;
    } else {
      final error = jsonDecode(response.body);
      FFAppState().errorMessage = error['message'] ?? 'Failed to create project';
      return null;
    }
  } catch (e) {
    FFAppState().errorMessage = 'Network error: $e';
    return null;
  } finally {
    FFAppState().isLoading = false;
  }
}
```

### 3.4 Transactions Actions

#### Fetch Transactions
Create `fetchTransactions`:

```dart
Future<List<dynamic>?> fetchTransactions(String? projectId, String? type) async {
  if (FFAppState().authToken.isEmpty) return null;
  
  try {
    FFAppState().isLoading = true;
    
    String url = '${FFAppConstants.API_BASE_URL}/finances';
    List<String> params = [];
    
    if (projectId != null && projectId.isNotEmpty) {
      params.add('project=$projectId');
    }
    if (type != null && type.isNotEmpty) {
      params.add('type=$type');
    }
    
    if (params.isNotEmpty) {
      url += '?' + params.join('&');
    }

    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
    ).timeout(Duration(seconds: FFAppConstants.API_TIMEOUT));

    if (response.statusCode == 200) {
      final transactions = jsonDecode(response.body) as List;
      FFAppState().transactions = transactions;
      return transactions;
    } else {
      FFAppState().errorMessage = 'Failed to fetch transactions';
      return null;
    }
  } catch (e) {
    FFAppState().errorMessage = 'Network error: $e';
    return null;
  } finally {
    FFAppState().isLoading = false;
  }
}
```

#### Create Transaction
Create `createTransaction`:

```dart
Future<Map<String, dynamic>?> createTransaction(
  String type,
  double amount,
  String description,
  String category,
  String projectId,
  String date,
) async {
  if (FFAppState().authToken.isEmpty) return null;
  
  try {
    FFAppState().isLoading = true;
    
    final transactionData = {
      'type': type,
      'amount': amount,
      'description': description,
      'category': category,
      'project': projectId,
      'date': date,
    };

    final response = await http.post(
      Uri.parse('${FFAppConstants.API_BASE_URL}/finances'),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(transactionData),
    ).timeout(Duration(seconds: FFAppConstants.API_TIMEOUT));

    if (response.statusCode == 201) {
      final newTransaction = jsonDecode(response.body);
      
      // Update local state
      List<dynamic> transactions = List.from(FFAppState().transactions);
      transactions.add(newTransaction);
      FFAppState().transactions = transactions;
      
      return newTransaction;
    } else {
      final error = jsonDecode(response.body);
      FFAppState().errorMessage = error['message'] ?? 'Failed to create transaction';
      return null;
    }
  } catch (e) {
    FFAppState().errorMessage = 'Network error: $e';
    return null;
  } finally {
    FFAppState().isLoading = false;
  }
}
```

## Step 4: Page Implementation

### 4.1 Login Page
1. Create a new page called `LoginPage`
2. Add email and password TextFields
3. Add a login Button
4. Set button action to call `loginUser` custom action
5. Navigate to dashboard on successful login

### 4.2 Companies Page
1. Create `CompaniesPage`
2. Add ListView widget
3. Set ListView data source to `FFAppState().companies`
4. Add FloatingActionButton for creating new companies
5. Implement pull-to-refresh with `fetchCompanies` action

### 4.3 Projects Page
1. Create `ProjectsPage`
2. Add ListView for projects
3. Implement filtering by company
4. Add project creation form

### 4.4 Transactions Page
1. Create `TransactionsPage`
2. Display transactions in ListView
3. Add filtering by project and type
4. Implement transaction creation

## Step 5: Navigation and State Management

### 5.1 App Initialization
In your main app widget, add initialization logic:
1. Check if user is logged in (token exists)
2. If logged in, fetch initial data
3. Set up automatic token refresh

### 5.2 Error Handling
1. Create global error display widget
2. Handle 401 errors by logging out user
3. Show user-friendly error messages

### 5.3 Offline Support
1. Cache important data locally
2. Show cached data when offline
3. Sync when connection restored

## Step 6: Testing

### 6.1 API Testing
1. Test each custom action individually
2. Verify token handling
3. Test error scenarios

### 6.2 UI Testing  
1. Test all user flows
2. Verify data updates correctly
3. Test offline scenarios

## Additional Features

### Push Notifications
1. Implement for approval requests
2. Set up for project updates
3. Configure for payment notifications

### File Upload
1. Implement for transaction attachments
2. Add image upload for company logos
3. Handle file validation

### Reporting
1. Create charts for financial data
2. Implement export functionality
3. Add date range filtering

This guide provides a complete roadmap for integrating your Business Management System API with FlutterFlow. Each step can be implemented incrementally, allowing you to build and test features progressively.
