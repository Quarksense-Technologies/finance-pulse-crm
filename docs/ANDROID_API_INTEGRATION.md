
# Android API Integration Guide

## Overview
This guide will help you integrate your Android app (FlutterFlow) with the Business Management System backend API.

## Base Configuration

### API Base URL
```
Production: https://bms.quarksense.in/api
Development: http://localhost:5000/api
```

### Authentication
All API requests require JWT token authentication:
```
Headers:
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 1. Authentication Flow

### Login Process
1. Send POST request to `/auth/login`
2. Store the received JWT token
3. Include token in all subsequent requests
4. Handle token expiration (401 responses)

### Sample Login Implementation
```dart
// FlutterFlow Custom Action
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>?> loginUser(String email, String password) async {
  try {
    final response = await http.post(
      Uri.parse('https://bms.quarksense.in/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Store token in FlutterFlow App State
      FFAppState().authToken = data['token'];
      FFAppState().currentUser = data;
      return data;
    }
    return null;
  } catch (e) {
    print('Login error: $e');
    return null;
  }
}
```

## 2. API Integration Patterns

### GET Requests (Fetch Data)
```dart
Future<List<dynamic>?> fetchCompanies() async {
  try {
    final response = await http.get(
      Uri.parse('https://bms.quarksense.in/api/companies'),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  } catch (e) {
    print('Fetch error: $e');
    return null;
  }
}
```

### POST Requests (Create Data)
```dart
Future<Map<String, dynamic>?> createCompany(Map<String, dynamic> companyData) async {
  try {
    final response = await http.post(
      Uri.parse('https://bms.quarksense.in/api/companies'),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(companyData),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    }
    return null;
  } catch (e) {
    print('Create error: $e');
    return null;
  }
}
```

### PUT Requests (Update Data)
```dart
Future<Map<String, dynamic>?> updateCompany(String id, Map<String, dynamic> companyData) async {
  try {
    final response = await http.put(
      Uri.parse('https://bms.quarksense.in/api/companies/$id'),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(companyData),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  } catch (e) {
    print('Update error: $e');
    return null;
  }
}
```

## 3. Data Binding in FlutterFlow

### App State Variables
Create these variables in FlutterFlow App State:
- `authToken` (String) - JWT token
- `currentUser` (JSON) - User information
- `companies` (List<dynamic>) - Companies list
- `projects` (List<dynamic>) - Projects list
- `transactions` (List<dynamic>) - Financial transactions

### Custom Data Types
Create these custom data types in FlutterFlow:

#### User Data Type
```
- id (String)
- name (String)
- email (String)
- role (String)
```

#### Company Data Type
```
- id (String)
- name (String)
- description (String)
- logo (String)
- contactInfo (JSON)
- address (JSON)
```

#### Project Data Type
```
- id (String)
- name (String)
- description (String)
- companyId (String)
- companyName (String)
- status (String)
- startDate (String)
- endDate (String)
- budget (double)
```

#### Transaction Data Type
```
- id (String)
- type (String)
- amount (double)
- description (String)
- category (String)
- project (String)
- date (String)
- status (String)
```

## 4. FlutterFlow Implementation Steps

### Step 1: Setup API Base URL
1. Go to App Settings > App Constants
2. Add constant: `API_BASE_URL` = `https://bms.quarksense.in/api`

### Step 2: Create Custom Actions
1. Go to Custom Code > Actions
2. Create these actions:
   - `loginUser`
   - `fetchCompanies`
   - `createCompany`
   - `fetchProjects`
   - `createProject`
   - `fetchTransactions`
   - `createTransaction`

### Step 3: Setup App State
1. Go to App State
2. Add variables as mentioned above
3. Set initial values appropriately

### Step 4: Create API Call Functions
For each feature, create corresponding API call functions:

#### Companies
- `fetchCompanies()` - GET /companies
- `fetchCompany(id)` - GET /companies/:id
- `createCompany(data)` - POST /companies
- `updateCompany(id, data)` - PUT /companies/:id
- `deleteCompany(id)` - DELETE /companies/:id

#### Projects
- `fetchProjects()` - GET /projects
- `fetchProject(id)` - GET /projects/:id
- `createProject(data)` - POST /projects
- `updateProject(id, data)` - PUT /projects/:id
- `deleteProject(id)` - DELETE /projects/:id

#### Finances
- `fetchTransactions()` - GET /finances
- `createTransaction(data)` - POST /finances
- `approveTransaction(id)` - PUT /finances/:id/approve
- `rejectTransaction(id, reason)` - PUT /finances/:id/reject

## 5. Error Handling

### Common Error Responses
```dart
void handleApiError(http.Response response) {
  switch (response.statusCode) {
    case 401:
      // Token expired - redirect to login
      FFAppState().authToken = '';
      // Navigate to login page
      break;
    case 403:
      // Forbidden - show permission error
      showSnackBar('You don\'t have permission for this action');
      break;
    case 404:
      // Not found
      showSnackBar('Resource not found');
      break;
    case 500:
      // Server error
      showSnackBar('Server error. Please try again later');
      break;
    default:
      showSnackBar('An error occurred');
  }
}
```

## 6. Pagination and Filtering

### URL Parameters for Filtering
```dart
String buildUrl(String endpoint, Map<String, String>? params) {
  if (params == null || params.isEmpty) return endpoint;
  
  final query = params.entries
      .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
      .join('&');
  
  return '$endpoint?$query';
}

// Usage
final url = buildUrl('/projects', {
  'status': 'in-progress',
  'company': 'company_id'
});
```

## 7. Real-time Updates

### Polling Strategy
```dart
Timer? _pollingTimer;

void startPolling() {
  _pollingTimer = Timer.periodic(Duration(seconds: 30), (timer) {
    fetchLatestData();
  });
}

void stopPolling() {
  _pollingTimer?.cancel();
}
```

## 8. Offline Support

### Cache Strategy
- Store critical data in local storage
- Sync when connection is restored
- Show offline indicators

### Local Storage
```dart
import 'package:shared_preferences/shared_preferences.dart';

Future<void> cacheData(String key, String data) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(key, data);
}

Future<String?> getCachedData(String key) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString(key);
}
```

## 9. Security Best Practices

1. **Never hardcode API keys**
2. **Always validate SSL certificates**
3. **Implement request timeouts**
4. **Use secure storage for tokens**
5. **Implement logout on token expiration**

## 10. Testing API Integration

### Test Endpoints
```dart
Future<void> testApiConnection() async {
  try {
    final response = await http.get(
      Uri.parse('${FFAppConstants.API_BASE_URL}/auth/me'),
      headers: {
        'Authorization': 'Bearer ${FFAppState().authToken}',
      },
    ).timeout(Duration(seconds: 10));

    if (response.statusCode == 200) {
      print('API connection successful');
    } else {
      print('API connection failed: ${response.statusCode}');
    }
  } catch (e) {
    print('API connection error: $e');
  }
}
```

This guide provides the foundation for integrating your Android app with the Business Management System API. Each section can be implemented incrementally in FlutterFlow.
