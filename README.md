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
- Spring Boot
- Spring Security
- OAuth2 (Google Login)
- JPA / Hibernate
- MySQL

### Frontend
- React.js
- Axios
- React Router

### DevOps
- GitHub
- GitHub Actions (CI)

---

## 📦 System Modules

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
