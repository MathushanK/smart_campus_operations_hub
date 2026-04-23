# Smart Campus Operations Hub - Complete Frontend Structure for Lovable AI

---

## 📋 PROJECT OVERVIEW

**Project Name:** Smart Campus Operations Hub  
**Purpose:** Full-stack web application for managing university facility bookings and maintenance operations  
**Course:** IT3030 – Programming Applications and Frameworks (SLIIT, 2026 Sem 1)  

The system allows:
- **Users** to browse/search campus resources, request bookings, report incidents, track tickets & receive notifications
- **Admins** to approve/reject bookings, manage resources, monitor system activity, assign technicians
- **Technicians** to view assigned work orders and maintenance tasks

---

## 🏗️ COMPLETE TECH STACK

### Frontend Technology Stack
- **Framework:** React 19.2.0 with Vite 7.3.1 (build tool)
- **Styling:** Tailwind CSS 4.2.2 (utility-first, responsive)
- **HTTP Client:** Axios 1.13.5 (with OAuth2 session credentials)
- **Routing:** React Router DOM 7.13.1 (client-side navigation)
- **Icons:** React Icons 5.5.0 (Feather UI set - FiXXX components)
- **State Management:** React Context API (for authentication)
- **Development:** ES Modules, Hot Module Replacement (HMR)
- **Package Manager:** npm

### Backend (Reference Structure)
- **Java 21** with Spring Boot 3.2.4
- **Security:** Spring Security + OAuth2 (Google Login)
- **Database:** MySQL 8
- **ORM:** JPA/Hibernate
- **API Format:** RESTful JSON endpoints on /api/v1

---

## 📦 COMPLETE FRONTEND FILE STRUCTURE

```
frontend/
├── public/                          # Static assets (favicon, etc.)
├── src/
│   ├── api/
│   │   └── api.js                  # Axios instance with base URL & credentials
│   ├── components/
│   │   ├── Layout.jsx              # Main wrapper with Sidebar & Navbar
│   │   ├── Sidebar.jsx             # Left navigation (role-based menu)
│   │   └── Navbar.jsx              # Top navbar (user profile, logout)
│   ├── config/
│   │   └── runtime.js              # Runtime configuration (API_BASE_URL, LOGOUT_URL)
│   ├── context/
│   │   └── AuthContext.jsx         # Global auth state (user, token, isAuthenticated)
│   ├── hooks/
│   │   └── useNotifications.js     # Custom hook for fetching notifications
│   ├── pages/
│   │   ├── Login.jsx               # OAuth2 Google login page (hero landing)
│   │   ├── AdminDashboard.jsx      # Admin overview (stats, quick actions)
│   │   ├── UserDashboard.jsx       # User overview (my bookings, resources, stats)
│   │   ├── TechnicianDashboard.jsx # Technician view (work orders, tasks)
│   │   ├── NotificationsPage.jsx   # Notifications center (all notifications list)
│   │   ├── BookingUserPage.jsx     # User booking management (create, view, manage bookings)
│   │   ├── BookingAdminPage.jsx    # Admin booking approval (approve/reject with reason)
│   │   └── ResourcesAdminPage.jsx  # Admin resource management (CRUD, cascade delete)
│   ├── routes/
│   │   ├── AppRoutes.jsx           # Main route definitions
│   │   └── ProtectedRoutes.jsx     # Role-based route protection HOC
│   ├── styles/
│   │   └── (component-specific styles if needed)
│   ├── utils/
│   │   └── auth.js                 # Auth helper functions (getDashboardPath, etc.)
│   ├── assets/                     # Images, logos, etc.
│   ├── App.jsx                     # Root component (Layout + Routes)
│   ├── App.css                     # App-level styles
│   ├── main.jsx                    # React entry point (createRoot)
│   └── index.css                   # Global Tailwind imports & CSS
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Vite build configuration
├── tailwind.config.js              # Tailwind customization
├── postcss.config.js               # PostCSS plugins for Tailwind
└── index.html                      # HTML entry point
```

---

## 🗄️ DATABASE SCHEMA & ENTITIES

### User Entity
```
- id: Long (PK)
- email: String
- name: String
- roles: Set<Role> (M2M relationship)
- bookings: List<Booking> (O2M)
- notifications: List<Notification> (O2M)
- createdAt: LocalDateTime (auto)
- updatedAt: LocalDateTime (auto)
```

### Role Entity
```
- roleId: Long (PK)
- roleName: String (ADMIN, USER, TECHNICIAN)
- users: Set<User> (M2M)
```

### Resource Entity
```
- resourceId: Long (PK)
- name: String
- description: String
- location: String
- status: Enum (ACTIVE, OUT_OF_SERVICE, MAINTENANCE)
- capacity: Integer (optional, for room capacity)
- availabilityStart: LocalTime (e.g., 08:00)
- availabilityEnd: LocalTime (e.g., 18:00)
- resourceType: ResourceType (M2O relationship)
- bookings: List<Booking> (O2M)
```

### ResourceType Entity
```
- typeId: Long (PK)
- typeName: String (e.g., Classroom, Lab, Auditorium)
- description: String
- resources: List<Resource> (O2M with cascade delete)
```

### Booking Entity
```
- bookingId: Long (PK)
- user: User (M2O)
- resource: Resource (M2O)
- date: LocalDate
- startTime: LocalTime
- endTime: LocalTime
- purpose: String
- attendees: Integer (optional)
- status: Enum (PENDING, APPROVED, REJECTED, CANCELLED)
- rejectionReason: String (optional)
- createdAt: LocalDateTime (auto)
- updatedAt: LocalDateTime (auto)
```

### Notification Entity
```
- id: Long (PK)
- user: User (M2O)
- title: String
- message: String
- type: Enum (BOOKING_APPROVED, BOOKING_REJECTED, WORK_ASSIGNED, etc.)
- read: Boolean (default: false)
- timestamp: LocalDateTime (auto)
```

---

## 🔌 API ENDPOINTS REFERENCE

Base URL: `http://localhost:8080/api/v1`

### Authentication (OAuth2 Google)
- `GET /auth/google` - Redirect to Google OAuth
- `GET /auth/callback` - Google OAuth callback (handled by Spring Security)
- `GET /auth/logout` - Logout endpoint

### User Management
- `GET /user/me` - Current authenticated user details
- `GET /users` - List all users (admin only)
- `PUT /users/{userId}` - Update user profile

### Bookings
- `GET /api/bookings` - Get user's bookings (paginated)
- `GET /api/bookings/{bookingId}` - Get booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{bookingId}` - Update booking
- `DELETE /api/bookings/{bookingId}` - Delete/remove pending booking
- `PATCH /api/bookings/{bookingId}/cancel` - Cancel approved booking
- `GET /api/bookings/check-conflicts` - Check time slot conflicts (params: resourceId, date, startTime, endTime)
- `GET /api/bookings?page=0&size=10&keyword=&status=` - Search & filter bookings (admin)
- `PATCH /api/bookings/{bookingId}/approve` - Approve booking (admin, body: optional reason)
- `PATCH /api/bookings/{bookingId}/reject` - Reject booking (admin, body: rejectionReason)

### Resources
- `GET /resources` - List all resources (with filters: status, type, location)
- `GET /resources/{resourceId}` - Get resource details
- `POST /resources` - Create resource (admin)
- `PUT /resources/{resourceId}` - Update resource (admin)
- `DELETE /resources/{resourceId}` - Delete resource (admin)

### Resource Types
- `GET /resource-types` - List all resource types
- `GET /resource-types/{typeId}` - Get resource type details
- `POST /resource-types` - Create resource type (admin)
- `PUT /resource-types/{typeId}` - Update resource type (admin)
- `DELETE /resource-types/{typeId}` - Delete resource type with cascade (admin)

### Notifications
- `GET /notifications` - Get user's notifications (paginated)
- `GET /notifications?read=false` - Get unread notifications
- `PATCH /notifications/{notificationId}/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read

### Admin Dashboard
- `GET /api/admin/stats` - Get admin dashboard stats (totalUsers, activeResources, pendingBookings, etc.)

---

## 🎨 DESIGN SYSTEM & COLOR PALETTE

### Primary Colors
- **Indigo**: `#6366F1` (Primary CTA, main accent) - Used for primary buttons, headers
- **Purple**: `#A855F7` (Secondary accent) - Used for gradients, secondary CTAs
- **Emerald**: `#10B981` (Success, approval) - Used for success messages, confirmed states
- **Amber**: `#F59E0B` (Warning) - Used for pending/warning states
- **Rose**: `#F43F5E` (Alert, error, technician) - Used for errors, technician theme

### Gradients (All pages use gradient headers)
- Admin Dashboard: `from-indigo-600 via-purple-600 to-indigo-700`
- User Dashboard: `from-indigo-600 via-indigo-500 to-purple-600`
- Technician Dashboard: `from-rose-600 via-rose-500 to-rose-600`
- Booking Pages: `from-indigo-600 via-purple-600 to-indigo-700` & `from-purple-600 via-purple-500 to-indigo-600`

### Typography & Spacing
- **Font:** System fonts (Tailwind default: ui-sans-serif)
- **Header Font Weight:** font-bold (fw-700)
- **Border Radius:** rounded-2xl (main cards), rounded-xl (inputs/modals)
- **Shadows:** shadow-lg (cards), shadow-2xl (modals/headers)
- **Padding:** p-6 (card content), p-8 (header sections)

### Layout
- **Sidebar Width:** w-72 (288px) - Fixed left navigation
- **Main Content:** Flexible with full-width sections
- **Grid:** grid-cols-1 (mobile), md:grid-cols-2/3/4 (responsive)
- **Gap:** gap-6 (standard spacing between elements)

### Icons
- **Icon Library:** React Icons (Feather set: Fi prefix)
- **Common Icons Used:**
  - FiHome (Dashboard)
  - FiBell (Notifications)
  - FiCalendar (Bookings/Dates)
  - FiClock (Time)
  - FiCheckCircle (Completed/Success)
  - FiAlertCircle (Warning/Alert)
  - FiBox (Resources)
  - FiBriefcase (Purpose/Work)
  - FiUsers (Users)
  - FiTrash (Delete)
  - FiEdit2 (Edit)
  - FiX (Close)

---

## 🔐 AUTHENTICATION FLOW

### Login Flow (OAuth2 Google)
1. User lands on `/` (Login.jsx)
2. Click "Sign in with Google"
3. Redirected to `http://localhost:8080/api/v1/auth/google`
4. Google OAuth consent screen
5. Redirected back to frontend with session cookie
6. React fetches `/api/v1/user/me` to populate AuthContext
7. User automatically redirected to role-based dashboard

### AuthContext Structure
```javascript
{
  user: {
    userId: number,
    email: string,
    name: string,
    role: "admin" | "user" | "technician"
  },
  isAuthenticated: boolean,
  loading: boolean,
  logout: () => void
}
```

### Protected Routes
- `ProtectedRoute` component wraps authenticated pages
- Checks `isAuthenticated` from AuthContext
- Optional `allowedRoles` prop for role-based access
- Redirects to `/` if not authenticated or unauthorized

### Role-Based Redirects
- **Admin** → `/admin/dashboard`
- **User** → `/user/dashboard`
- **Technician** → `/technician/dashboard`

---

## 📋 PAGE-BY-PAGE STRUCTURE

### 1. **Login Page** (`/`)
**Component:** `Login.jsx`
- **Features:**
  - Apple-inspired hero landing section
  - "Sign in with Google" button
  - Gradient background (indigo to purple)
  - Floating glass-morphism cards explaining features
  - Hero image or campus illustration
  - Mobile responsive full-screen
- **No Sidebar:** Full width experience
- **Auth Check:** Redirect authenticated users to dashboard
- **Icons:** None (hero-focused design)

---

### 2. **Admin Dashboard** (`/admin/dashboard`)
**Component:** `AdminDashbord.jsx`
**Access:** Admin role only
- **Header Section:**
  - Gradient header bar: `from-indigo-600 via-purple-600 to-indigo-700`
  - Title: "Admin Dashboard" with FiActivity icon
  - Subtitle: "System overview and key metrics"
  - Right-aligned: Admin name and timestamp

- **Stats Cards Grid** (4 columns, responsive):
  - Total Users (FiUsers, Indigo)
  - Active Resources (FiBox, Emerald)
  - Pending Bookings (FiClock, Amber)
  - System Health (FiCheckCircle, Rose)
  - Each card shows icon + large number + trend
  - Real data fetched from `/api/admin/stats`

- **Quick Actions Section:**
  - Add User button (gradient)
  - View Reports button
  - Settings button
  - Each with icon and action text

- **Notifications Panel** (right sidebar or collapsible):
  - List of recent system notifications
  - Unread badge count
  - Expandable notification items
  - Mark as read functionality
  - Fetch from `/notifications` endpoint

- **System Info Footer:**
  - API Status indicator
  - Last data update timestamp
  - Version info

---

### 3. **User Dashboard** (`/user/dashboard`)
**Component:** `UserDashboard.jsx`
**Access:** User role only
- **Header Section:**
  - Gradient header: `from-indigo-600 via-indigo-500 to-purple-600`
  - Title: "Welcome back, {userName}!" (no emoji)
  - Subtitle: "View your bookings and available resources"
  - Right-aligned: User email

- **Stats Cards Grid** (3 columns):
  - My Bookings (FiCalendar, Indigo)
  - Available Resources (FiBox, Emerald)
  - Pending Approvals (FiClock, Amber)
  - Real data from `/api/bookings` and `/resources`

- **Available Resources Preview Section:**
  - Horizontal scrollable cards
  - Each card: Resource name, type, location, availability
  - "Book Now" button on each card
  - Quick view of 5 most popular resources

- **Notifications Panel:**
  - Show only user-relevant notifications
  - Notifications about booking status changes
  - Mark as read
  - Link to full notifications page

- **Quick Action Buttons (Grid):**
  - Book a Resource (FiCalendar)
  - View My Bookings (FiList)
  - Request Maintenance (FiTool)
  - View Profile (FiUser)
  - Get Help (FiHelp)

---

### 4. **Technician Dashboard** (`/technician/dashboard`)
**Component:** `TechnicianDashboard.jsx`
**Access:** Technician role only
- **Header Section:**
  - Gradient header: `from-rose-600 via-rose-500 to-rose-600`
  - Title: "Technician Dashboard" (with FiActivity icon)
  - Subtitle: "Manage work orders and maintenance tasks"

- **Stats Cards Grid** (3 columns):
  - Active Tasks (FiActivity, Rose)
  - Resolved Issues (FiCheckCircle, Emerald)
  - Pending Issues (FiAlertCircle, Amber)
  - Real data from work order system

- **Work Orders & Notifications Section:**
  - List of assigned work orders
  - Each item shows: priority indicator, title, status badge
  - Unread badge for new assignments
  - Click to expand details (resource, date, description)
  - Mark as completed button

- **Priority Indicators:**
  - High (Red)
  - Medium (Amber)
  - Low (Gray)

---

### 5. **Notifications Page** (`/notifications`)
**Component:** `NotificationsPage.jsx`
**Access:** All authenticated users
- **Header:**
  - Title: "Notifications" (with FiBell icon)
  - Total unread count badge
  - "Mark all as read" button

- **Filter Tabs:**
  - All (show all notifications)
  - Unread (only unread)
  - Bookings (booking-related)
  - System (system announcements)

- **Notification List:**
  - Infinite scroll or pagination
  - Each notification item shows:
    - Icon based on type
    - Title and message
    - Timestamp
    - Read/unread indicator (visually distinct)
    - Action buttons (e.g., "View Booking", "Approve")
  - Fetch from `/notifications` paginated endpoint

- **Empty State:**
  - Message: "No notifications"
  - Icon: FiBell with opacity

---

### 6. **Booking User Page** (`/user/bookings`)
**Component:** `BookingUserPage.jsx`
**Access:** User role only
- **Header Section:**
  - Gradient: `from-indigo-600 via-purple-600 to-indigo-700`
  - Title: "My Bookings" (with FiCalendar icon)
  - Subtitle: "Create, manage, and track your resource bookings"

- **Create/Edit Booking Form** (Collapsible Section):
  - Expandable form with toggle arrow
  - **Form Fields:**
    - Resource Selection (dropdown, grouped by type)
    - Date (date input, min today)
    - Start Time (time input)
    - End Time (time input)
    - Purpose (textarea)
    - Expected Attendees (number input, if resource has capacity)
  - **Real-time Validation:**
    - Resource availability window display
    - Conflict detection (red border if time slot taken)
    - Attendee capacity check
  - **Submit Buttons:**
    - Create/Update button (gradient, enabled when valid)
    - Cancel button
  - **Error Messages:**
    - Display inline under each field with FiAlertCircle icon
    - Conflict warnings in red box with alert styling

- **Search & Filter Section:**
  - Search by purpose/resource keyword
  - Filter by status (All, Pending, Approved, Rejected, Cancelled)
  - Clear filters button

- **Bookings List/Table:**
  - Responsive table/card grid
  - Columns: Resource, Type, Date, Time, Status, Actions
  - Status badges: color-coded (Amber=Pending, Green=Approved, Red=Rejected, Gray=Cancelled)
  - Action buttons: Edit (FiEdit2), Cancel (FiX)
  - Click to expand details
  - Fetch from `/api/bookings?page=0&size=10`

- **Alert Messages:**
  - Success: Green box with FiCheckCircle (booking created/updated)
  - Error: Red box with FiAlertCircle
  - Auto-dismiss after 3 seconds

---

### 7. **Booking Admin Page** (`/admin/bookings`)
**Component:** `BookingAdminPage.jsx`
**Access:** Admin role only
- **Header Section:**
  - Gradient: `from-purple-600 via-purple-500 to-indigo-600`
  - Title: "Booking Management" (with FiFeather icon)
  - Subtitle: "Review, approve, and manage all resource bookings"

- **Admin Stats Cards** (4 columns):
  - Total Bookings (FiCalendar)
  - Pending (FiClock)
  - Approved (FiCheckCircle)
  - Rejected (FiAlertCircle)
  - Real data from `/api/bookings` GET

- **Search & Filter Section:**
  - Full-width search bar (by user, resource, email)
  - Status filter dropdown (All, Pending, Approved, Rejected, Cancelled)
  - Clear filters button
  - Fetch from `/api/bookings?keyword=&status=`

- **Bookings Table:**
  - Columns: User, Email, Resource, Date/Time, Status, Actions
  - Status badges: color-coded
  - Action buttons:
    - Approve (green button with FiCheckCircle)
    - Reject (red button with FiX)
  - Pagination: Previous/Next buttons

- **Approve/Reject Modals:**
  - **Approve Modal:**
    - Confirm button
    - Cancel button
    - PATCH to `/api/bookings/{id}/approve`
  - **Reject Modal:**
    - Textarea for rejection reason
    - Confirm + Cancel buttons
    - PATCH to `/api/bookings/{id}/reject` with body: { rejectionReason }
  - Both show booking details before confirmation

---

### 8. **Resources Admin Page** (`/admin/resources`)
**Component:** `ResourcesAdminPage.jsx`
**Access:** Admin role only
- **Header Section:**
  - Gradient header
  - Title: "Resources Management" (with FiBox icon)
  - Subtitle: "Manage resource types and individual resources"

- **Resource Stats Cards** (4 columns):
  - Total Resources (FiBox)
  - Resource Types (FiTags)
  - Active (FiCheckCircle)
  - Out of Service (FiAlertCircle)
  - Real data from `/resources` and `/resource-types`

- **Two-Section Layout:**

  **Section 1: Resource Types Table** (Top)
  - Columns: Type Name, Description, Resource Count, Actions
  - Buttons: Add Type, Edit (FiEdit2), Delete (FiTrash)
  - **Cascade Delete Warning:** "Deletes all resources of this type"
  - Modals:
    - Add Type Modal: name, description inputs
    - Edit Type Modal: prefilled fields
    - Delete Confirmation: "Are you sure? This will delete all resources of this type."
  - API: POST/PUT/DELETE to `/resource-types`

  **Section 2: Resources Table** (Bottom)
  - Columns: Name, Type, Location, Availability, Capacity, Status, Actions
  - Buttons: Add Resource, Edit (FiEdit2), Delete (FiTrash)
  - Status badge: ACTIVE (green), OUT_OF_SERVICE (red), MAINTENANCE (amber)
  - Modals:
    - Add/Edit Resource Modal:
      - Name, Description
      - Resource Type (dropdown from `/resource-types`)
      - Location
      - Capacity (number)
      - Availability Start Time (time input)
      - Availability End Time (time input)
      - Status (select: ACTIVE, OUT_OF_SERVICE, MAINTENANCE)
    - Delete Confirmation: "Are you sure?"
  - Search/Filter:
    - By name/location keyword
    - By resource type
    - By status
  - Fetch from `/resources?status=&type=&keyword=`
  - API: POST/PUT/DELETE to `/resources`

- **Modal Styling:**
  - Gradient background for titles
  - Form fields with border-2 (not shadow-heavy)
  - Action buttons: gradient CTAs
  - Icon-based close button (FiX)

---

## 🔌 API REQUEST/RESPONSE EXAMPLES

### Booking Creation (User)
```javascript
POST /api/bookings
Content-Type: application/json

{
  "resourceId": 5,
  "date": "2026-04-25",
  "startTime": "14:00:00",
  "endTime": "15:30:00",
  "purpose": "Team meeting",
  "attendees": 8
}

// Response: 201 Created
{
  "bookingId": 42,
  "user": { "userId": 3, "email": "user@campus.edu", "name": "John Doe" },
  "resource": { "resourceId": 5, "name": "Conference Room A", ... },
  "date": "2026-04-25",
  "startTime": "14:00:00",
  "endTime": "15:30:00",
  "purpose": "Team meeting",
  "attendees": 8,
  "status": "PENDING",
  "createdAt": "2026-04-20T10:30:00"
}
```

### Conflict Check (User)
```javascript
GET /api/bookings/check-conflicts?resourceId=5&date=2026-04-25&startTime=14:00:00&endTime=15:30:00

// Response: 200 OK
{
  "hasConflict": false,
  "message": "Time slot available"
}

// Or conflict response:
{
  "hasConflict": true,
  "message": "Time slot is already booked. Please choose a different time"
}
```

### Admin Dashboard Stats
```javascript
GET /api/admin/stats

// Response: 200 OK
{
  "totalUsers": 248,
  "activeResources": 45,
  "pendingBookings": 12,
  "systemHealth": "Healthy",
  "lastUpdate": "2026-04-20T11:00:00"
}
```

### Booking Approval (Admin)
```javascript
PATCH /api/bookings/42/approve

// Response: 200 OK (sends notification to user)
{
  "bookingId": 42,
  "status": "APPROVED",
  "approvedBy": "admin@campus.edu",
  "approvedAt": "2026-04-20T11:05:00"
}
```

### Booking Rejection (Admin)
```javascript
PATCH /api/bookings/42/reject
Content-Type: application/json

{
  "rejectionReason": "Resource was booked for maintenance on that date"
}

// Response: 200 OK (sends notification to user)
{
  "bookingId": 42,
  "status": "REJECTED",
  "rejectionReason": "Resource was booked for maintenance on that date",
  "rejectedBy": "admin@campus.edu",
  "rejectedAt": "2026-04-20T11:05:00"
}
```

---

## 🚀 SETUP INSTRUCTIONS FOR LOVABLE AI

### Prerequisites
- React 19.2.0+
- Node.js 16+
- npm

### Installation
```bash
# From the frontend directory
npm install

# Install dependencies including:
# - react, react-dom, react-router-dom
# - axios (for backend API calls)
# - react-icons (Feather UI icon set)
# - tailwindcss, postcss, autoprefixer
# - vite (build tool)
```

### Configuration
1. **Runtime Configuration** (`src/config/runtime.js`):
   ```javascript
   // Point to your backend
   export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080/api/v1';
   export const LOGOUT_URL = `${API_BASE_URL}/auth/logout`;
   ```

2. **Tailwind Configuration** (`tailwind.config.js`):
   - Use Tailwind CSS 4.2.2
   - Include content paths for React components
   - Customize color palette (Indigo, Purple, Emerald, Amber, Rose)

3. **Vite Configuration** (`vite.config.js`):
   - Use @vitejs/plugin-react
   - Configure API proxy for development: `/api/v1` → `http://localhost:8080/api/v1`

### Running Development Server
```bash
npm run dev
# Runs on http://localhost:5173/
```

### Building for Production
```bash
npm run build
# Outputs to dist/ folder
```

---

## 🔗 INTEGRATION POINTS

### With Backend (Spring Boot)
- **Axios Instance** with `withCredentials: true` for OAuth2 session handling
- **Base URL:** Configurable in `src/config/runtime.js`
- **API Endpoints:** All RESTful JSON responses from `/api/v1/*`
- **Error Handling:** Global error messages, HTTP status codes
- **Authentication:** OAuth2 session cookies stored in browser

### State Management
- **AuthContext:** Manages user, role, and authentication state globally
- **Local State (useState):** For component-level form states, modals, loading
- **No Redux:** Keep it simple with Context API

### Routing Structure
- **Public Route:** `/` (Login)
- **Protected Routes:** All others require authentication
- **Role-Based Access:** Admin, User, Technician routes separated
- **Dynamic Redirects:** Auto-route to correct dashboard based on role

---

## 📱 RESPONSIVE DESIGN REQUIREMENTS

- **Mobile First:** Design for mobile, enhance for desktop
- **Breakpoints:** SM (640px), MD (768px), LG (1024px), XL (1280px)
- **Sidebar:** Collapsible on tablet/mobile
- **Tables:** Convert to card layout on mobile
- **Grid:** 1 column (mobile), 2-4 columns (desktop)
- **Touch-friendly:** Button min-height 44px for mobile

---

## ✅ QUALITY CHECKLIST

Before deployment:
- [ ] All pages redirect correctly based on user role
- [ ] Form validation shows error messages with icons
- [ ] Real-time conflict detection works for bookings
- [ ] Notifications fetch and display in real-time
- [ ] Logout properly clears session
- [ ] Mobile responsiveness tested
- [ ] Icons render correctly (React Icons Feather set)
- [ ] Gradients are consistent across pages
- [ ] Loading spinners show during API calls
- [ ] Error states are user-friendly
- [ ] Data refetches after CRUD operations
- [ ] Pagination works for list pages

---

## 🎯 KEY POINTS FOR LOVABLE AI

1. **No Emojis:** Use React Icons (FiXXX from 'react-icons/fi') exclusively
2. **Tailwind First:** All styling via Tailwind CSS, no inline styles
3. **Real Data:** All pages must fetch from backend API, no dummy data
4. **Apple-Inspired:** Clean, minimalist design with borders (not heavy shadows)
5. **Role-Based:** Admin/User/Technician have different dashboards and menu items
6. **Responsive:** Works seamlessly on mobile, tablet, desktop
7. **Accessibility:** Use semantic HTML, ARIA labels where needed
8. **Performance:** Use React.memo for expensive components, lazy load pages
9. **Error Handling:** Show user-friendly error messages, not console errors
10. **State Management:** React Context for global auth, useState for local component state

---

## 📞 BACKEND DEPENDENCIES

The frontend expects the backend to provide:
- OAuth2 Google authentication with session cookies
- RESTful API on `/api/v1/` with JSON responses
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Pagination support (page, size parameters)
- CORS configuration for frontend domain
- Consistent error response format

---

**END OF PROMPT**

This document is comprehensive and ready to share with Lovable AI for a complete frontend regeneration.
