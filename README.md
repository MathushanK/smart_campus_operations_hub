# smart_campus_operations_hub

# 🎓 Smart Campus Operations Hub  
IT3030 – Programming Applications and Frameworks  
SLIIT – 2026 Semester 1  

## 📌 Project Overview

Smart Campus Operations Hub is a full-stack web application designed to manage university facility bookings and maintenance operations.

The system allows users to:
- Browse and search campus resources
- Request bookings
- Report incidents
- Track ticket progress
- Receive notifications

Admins can:
- Approve or reject bookings
- Assign technicians
- Manage resources
- Monitor system activity

---

## 🏗️ Tech Stack

### Backend
- Java 21
- Spring Boot 3.2.4
- Spring Security
- OAuth2 (Google Login)
- JPA / Hibernate
- MySQL

### Frontend
- React.js (Vite)
- Axios
- React Router

### DevOps
- GitHub
- GitHub Actions (CI)

---

## 🚀 Getting Started

### Backend Setup
1. **Environment Sync**: Ensure you have **Java 21** and **Maven** installed.
2. **Database Connection**: 
   - Create a MySQL database named `smart_campus_hub`.
   - Update `backend/src/main/resources/application.properties` with your local MySQL `username` and `password`.
3. **Dependencies**: 
   - Run `mvn clean install` inside the `backend` folder to download all required dependencies.
   - Alternatively, import the project into your IDE (IntelliJ/Eclipse) using the `pom.xml` file.
4. **Running the App**: Execute `./mvnw spring-boot:run` to start the server on `http://localhost:8080/api/v1`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.

---

## 📂 Project Structure

### Backend Architecture
The backend follows a standard N-tier architecture for clean separation of concerns:
- `controller`: REST API endpoints.
- `service`: Business logic layer.
- `model`: Entity definitions (JPA).
- `repository`: Data access layer (Spring Data JPA).
- `dto`: Data Transfer Objects for API requests/responses.
- `exception`: Global exception handling.
- `config`: Security and system configurations.

### Frontend Architecture
- `src/api`: Axios instances and API services.
- `src/components`: Reusable UI components.
- `src/context`: React Context for state management (Auth, etc.).
- `src/pages`: Main application views.
- `src/routes`: Route definitions.
- `src/styles`: Global and component-specific styles.

---

## �️ Development Guidelines

### Folder Structure & Git
To ensure the project structure is preserved on GitHub, empty folders contain a `.gitkeep` file.
- **Rule**: Once a folder has a real code file inside it, you can delete the `.gitkeep`. If the folder is empty, keep the `.gitkeep`.

---

## �📦 System Modules

### Module A – Facilities & Assets Catalogue
- CRUD operations for resources
- Search & filtering

### Module B – Booking Management
- Booking request workflow
- Conflict detection
- Admin approval system

### Module C – Maintenance & Incident Ticketing
- Ticket creation with image attachments
- Technician assignment
- Comment system

### Module D – Notifications
- Real-time booking & ticket notifications
- Notification panel in UI

### Module E – Authentication & Authorization
- Google OAuth2 login
- Role-based access control (USER / ADMIN)

---

## 🗄️ Database

Relational database with tables:

- users
- resources
- bookings
- tickets
- ticket_images
- comments
- notifications

---

## 🔐 Security

- OAuth2 authentication
- Role-based endpoint protection
- Input validation
- Secure file handling
- Global exception handling

---

## 🧪 Testing

- Unit testing (Service layer)
- Postman API collection
- Validation testing
- Conflict detection testing

---

## 🚀 Running the Project

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔄 CI/CD

GitHub Actions workflow:
- Build backend
- Run tests
- Build frontend

---

## 👥 Team Contribution

| Member | Responsibilities |
|--------|------------------|
| Member 1 | Resource Management |
| Member 2 | Booking Workflow |
| Member 3 | Incident & Ticket Module |
| Member 4 | Notifications & Security |

Each member implemented at least four REST endpoints using different HTTP methods.

---

## 📷 Evidence

Screenshots and demo video available in the `/docs` folder.

---

## 📜 License

This project is developed for academic purposes for IT3030 – SLIIT.
