# Electronics Store Application

A POC project that represents an online electronics store to prove out Agentic Driven Development ideas.

Main branch is the baseline code used for repeating the process.  The other branches are the results of running the agentic tools with different scenarios.

Using an agentic IDE or other agentic tools, the user will be able to provide the prompt in UserStoryExpanded.prompt.md and the agentic tools will generate the code and tests based on the prompt.  A user story and test feature file will be the inputs to the agentic tool.

### Branches
user-story-add-user-registration branch- agentic produced implementation of a user registration user story

user-story-add-user-registration-with-tests branch- agentic produced implementation of a user registration user story with tests


A full-stack e-commerce application for an electronics store, featuring secure user authentication, product catalog management, shopping cart functionality, and administrative capabilities.

## Features

### User Features
- **User Registration and Authentication**
- **Product Management**
- **Shopping Cart**
- **User Profile**

### Admin Features
- **Product Management**
- **User Management**

## Tech Stack

### Backend
- Java Spring Boot
- Spring Security for authentication and authorization
- Spring Data JPA for database access
- H2 Database (for development)
- JUnit and Spring Test for integration testing

### Frontend
- React with TypeScript
- Redux for state management
- Material-UI for component library
- React Hook Form for form validation
- Yup for schema validation
- Axios for API requests

## Project Structure

```
electronics-store/
├── backend/                   # Spring Boot application
├── frontend/                  # React application
└── userstory/                 # User stories and documentation
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- Maven

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
The backend will run on http://localhost:8080

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on http://localhost:5173

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```


