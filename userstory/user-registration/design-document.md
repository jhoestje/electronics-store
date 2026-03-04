# Design Document: User Registration System

## Overview
This document outlines the technical design for completing the user registration functionality in the electronics store application. The backend API is substantially implemented, requiring frontend component development, enhanced validation, and integration improvements.

## Package Structure

### Backend (Existing)
```
com.store.electronics/
├── controller/
│   └── AuthController.java          # ✅ Existing - /api/auth/register endpoint
├── service/
│   └── AuthService.java             # ✅ Existing - Registration logic
├── model/
│   └── User.java                    # ✅ Existing - User entity with roles
├── dto/
│   ├── RegisterRequest.java        # ✅ Existing - Registration DTO
│   └── AuthResponse.java            # ✅ Existing - Response DTO
└── repository/
    └── UserRepository.java          # ✅ Existing - User data access
```

### Frontend (To Be Created)
```
src/
├── pages/
│   └── Register.tsx                 # 🆕 Registration form component
├── components/
│   └── Navbar.tsx                   # ✅ Existing - Already has register button
├── store/slices/
│   └── authSlice.ts                 # ✅ Existing - Needs registration actions
├── services/
│   └── api.ts                       # ✅ Existing - Has register API method
└── types/
    └── index.ts                     # ✅ Existing - User interface defined
```

## Component Diagram

### Backend Components
```
AuthController
    ↓
AuthService
    ↓ ↓ ↓
UserRepository PasswordEncoder AuthenticationManager
    ↓
User Entity (JPA)
```

### Frontend Components
```
Register.tsx (Formik Form)
    ↓
authSlice.ts (Redux Actions)
    ↓
authAPI.register() (API Service)
    ↓
AuthController (/api/auth/register)
```

## API Contracts

### Existing Endpoint
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "string (required, unique)",
  "email": "string (required, email format, unique)",
  "password": "string (required)"
}

Response Body (200 OK):
{
  "user": {
    "id": 1,
    "username": "johnsmith",
    "email": "johnsmith@email.com",
    "roles": ["ROLE_CUSTOMER"]
  },
  "token": "jwt-token-string"
}

Response Body (400 Bad Request):
{
  "error": "Username already exists" | "Email already exists"
}
```

## Data Model

### User Entity (Existing)
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @JsonIgnore
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String email;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles;
}
```

### Frontend User Interface (Existing)
```typescript
interface User {
    id?: number;
    username: string;
    email: string;
    roles: string[];
}
```

## Security Flow

### JWT Authentication Flow
1. User submits registration form
2. Frontend validates form with Yup schema
3. API call to `/api/auth/register`
4. Backend validates uniqueness and password strength
5. Password encoded with PasswordEncoder
6. User saved with ROLE_CUSTOMER (first user gets ROLE_ADMIN)
7. JWT token generated and returned
8. Frontend stores token in localStorage
9. User redirected to login or home page

### Role-Based Access Control
- **ROLE_CUSTOMER**: Default for all new users
- **ROLE_ADMIN**: First registered user automatically
- Navigation and routes protected by user roles

## Error Handling Strategy

### Backend Validation Errors
- **Username exists**: HTTP 400 with "Username already exists"
- **Email exists**: HTTP 400 with "Email already exists"
- **Weak password**: HTTP 400 with password requirements
- **Validation errors**: HTTP 400 with field-specific errors

### Frontend Error Handling
- Form-level validation with Yup
- Real-time field validation feedback
- API error display in toast/snackbar
- Loading states during registration

## Configuration

### Backend Enhancements Needed
```yaml
# application.yml (potential additions)
security:
  password:
    min-length: 8
    require-uppercase: true
    require-lowercase: true
    require-digit: true
    require-special-char: true
```

### Frontend Configuration
- Material UI theme already configured
- Formik validation schema needed
- Redux store actions for registration

## Frontend Integration

### Register.tsx Component Design
```typescript
// Component structure similar to Login.tsx
- Material UI Container, Paper, Typography
- Formik form with Yup validation
- Fields: username, email, password, confirm password
- Submit button with loading state
- Link to login page
- Error display for API failures
```

### Redux Integration
```typescript
// New actions needed in authSlice.ts
registerStart: (state) => { /* loading state */ }
registerSuccess: (state, action) => { /* success handling */ }
registerFailure: (state, action) => { /* error handling */ }
```

### Navigation Updates
```typescript
// App.tsx route addition
<Route path="/register" element={<Register />} />
```

## Password Strength Validation

### Backend Implementation
```java
// Add to AuthService or create PasswordValidator
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one digit
- At least one special character
```

### Frontend Validation
```typescript
// Yup schema for registration
const registrationSchema = yup.object({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain uppercase letter')
    .matches(/[a-z]/, 'Must contain lowercase letter')
    .matches(/[0-9]/, 'Must contain a digit')
    .matches(/[^A-Za-z0-9]/, 'Must contain special character')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});
```

## Implementation Tasks

### Backend Enhancements

#### Task 1: Enhanced Password Validation (Complexity: M)
- Create `PasswordValidator` utility class
- Add password strength rules to `AuthService.register()`
- Implement proper exception handling for weak passwords
- Update error messages for security compliance

#### Task 2: Improved Error Handling (Complexity: S)
- Create custom exception classes: `UsernameExistsException`, `EmailExistsException`
- Update `GlobalExceptionHandler` for registration errors
- Ensure error messages don't leak sensitive information

#### Task 3: JWT Token Implementation (Complexity: M)
- Replace dummy tokens with proper JWT implementation
- Add JWT configuration properties
- Update token generation in registration and login

### Frontend Development

#### Task 4: Registration Component (Complexity: M)
- Create `Register.tsx` component based on `Login.tsx` pattern
- Implement Material UI form with proper styling
- Add form fields: username, email, password, confirm password
- Add navigation link to login page

#### Task 5: Form Validation (Complexity: S)
- Create Yup validation schema for registration
- Implement real-time field validation
- Add password strength indicator
- Handle confirm password matching

#### Task 6: Redux Integration (Complexity: S)
- Add registration actions to `authSlice.ts`
- Implement `registerStart`, `registerSuccess`, `registerFailure`
- Update auth state management for registration flow

#### Task 7: Navigation and Routing (Complexity: S)
- Add `/register` route to `App.tsx`
- Ensure proper navigation between login/register
- Update navbar for unauthenticated users

#### Task 8: API Integration (Complexity: S)
- Connect registration form to `authAPI.register()`
- Handle loading states and error responses
- Implement success redirect logic

### Integration & Testing

#### Task 9: End-to-End Testing (Complexity: M)
- Test complete registration flow
- Verify role assignment (first user = admin)
- Test all validation scenarios from Cucumber features
- Ensure proper token storage and redirect

#### Task 10: Error Scenario Testing (Complexity: S)
- Test duplicate username/email scenarios
- Test weak password validation
- Test network error handling
- Verify user-friendly error messages

## Task Dependencies

```
Task 1 → Task 2 → Task 3 (Backend sequence)
Task 4 → Task 5 → Task 6 → Task 7 → Task 8 (Frontend sequence)
Task 9 depends on: Tasks 1, 4, 5, 6, 7, 8
Task 10 depends on: Tasks 2, 5, 8
```

## Estimated Timeline
- **Backend Tasks**: 2-3 hours
- **Frontend Tasks**: 2-3 hours  
- **Integration & Testing**: 1-2 hours
- **Total**: 5-8 hours (within Medium complexity estimate)

## Risks and Open Questions

### Technical Risks

#### Risk 1: JWT Token Implementation (Medium Risk)
- **Issue**: Current implementation uses dummy tokens
- **Impact**: Authentication will not work properly
- **Mitigation**: Implement proper JWT configuration before testing
- **Dependencies**: Spring Security JWT library configuration

#### Risk 2: Password Validation Complexity (Low Risk)
- **Issue**: Password strength requirements may be too strict
- **Impact**: User experience degradation
- **Mitigation**: Test with various password combinations
- **Dependencies**: Frontend/backend validation alignment

#### Risk 3: Frontend-Backend Validation Mismatch (Medium Risk)
- **Issue**: Yup schema may not match backend validation exactly
- **Impact**: Inconsistent user experience
- **Mitigation**: Align validation rules between frontend and backend
- **Dependencies**: Coordination between validation implementations

### Integration Risks

#### Risk 4: Redux State Management (Low Risk)
- **Issue**: Registration state may not integrate properly with existing auth flow
- **Impact**: User authentication state inconsistencies
- **Mitigation**: Follow existing authSlice patterns
- **Dependencies**: Understanding of current Redux structure

#### Risk 5: Navigation Flow (Low Risk)
- **Issue**: Registration success redirect may be confusing
- **Impact**: Poor user experience
- **Mitigation**: Test user flow from registration to authenticated state
- **Dependencies**: Clear UX requirements for post-registration flow

### Security Risks

#### Risk 6: Error Message Information Leakage (Low Risk)
- **Issue**: Error messages may reveal system information
- **Impact**: Security vulnerability
- **Mitigation**: Review all error messages for information disclosure
- **Dependencies**: Security review of error handling

#### Risk 7: Token Storage Security (Low Risk)
- **Issue**: LocalStorage token storage may be vulnerable
- **Impact**: Authentication token theft
- **Mitigation**: Current approach matches existing pattern, document as known limitation
- **Dependencies**: Security architecture decisions

### Open Questions

#### Question 1: Post-Registration Redirect
- **Current Assumption**: Redirect to login page after successful registration
- **Alternative**: Auto-login user and redirect to home page
- **Decision Needed**: UX preference for registration flow

#### Question 2: Password Strength Requirements
- **Current Plan**: Implement comprehensive password validation
- **Alternative**: Simpler requirements for better UX
- **Decision Needed**: Balance between security and user experience

#### Question 3: Email Verification
- **Current Plan**: No email verification required
- **Alternative**: Add email verification for enhanced security
- **Decision Needed**: Scope determination for security features

#### Question 4: Admin Role Assignment
- **Current Implementation**: First user automatically gets admin role
- **Alternative**: Manual admin assignment or separate admin registration
- **Decision Needed**: Admin user management strategy

### Risk Mitigation Strategy

#### High-Priority Mitigations
1. **JWT Implementation**: Complete before integration testing
2. **Validation Alignment**: Ensure frontend/backend validation matches
3. **Error Message Review**: Security review of all user-facing errors

#### Medium-Priority Mitigations
1. **User Flow Testing**: Comprehensive testing of registration flow
2. **State Management Testing**: Verify Redux integration
3. **Security Review**: Review authentication and token storage

#### Low-Priority Mitigations
1. **UX Refinement**: Post-registration redirect optimization
2. **Password Requirements**: Adjust based on user feedback
3. **Future Enhancements**: Document email verification for future consideration

### Success Criteria for Risk Mitigation
- All registration scenarios from Cucumber features pass
- No security vulnerabilities in error messages
- Consistent validation between frontend and backend
- Smooth user experience from registration to authenticated state
- Proper role assignment and token handling
