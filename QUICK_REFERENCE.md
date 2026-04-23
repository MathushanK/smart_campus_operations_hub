# QUICK REFERENCE - File Structure & Setup

## 📂 EXACT FILE STRUCTURE

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── api.js                         ← Axios instance
│   ├── components/
│   │   ├── Layout.jsx                     ← Main wrapper with Sidebar
│   │   ├── Sidebar.jsx                    ← Left navigation (role-based)
│   │   └── Navbar.jsx                     ← Top navbar
│   ├── config/
│   │   └── runtime.js                     ← API_BASE_URL config
│   ├── context/
│   │   └── AuthContext.jsx                ← Global auth state
│   ├── hooks/
│   │   └── useNotifications.js            ← Notifications hook
│   ├── pages/
│   │   ├── Login.jsx                      ← Route: /
│   │   ├── AdminDashbord.jsx              ← Route: /admin/dashboard
│   │   ├── UserDashboard.jsx              ← Route: /user/dashboard
│   │   ├── TechnicianDashboard.jsx        ← Route: /technician/dashboard
│   │   ├── NotificationsPage.jsx          ← Route: /notifications
│   │   ├── BookingUserPage.jsx            ← Route: /user/bookings
│   │   ├── BookingAdminPage.jsx           ← Route: /admin/bookings
│   │   └── ResourcesAdminPage.jsx         ← Route: /admin/resources
│   ├── routes/
│   │   ├── AppRoutes.jsx                  ← Route definitions
│   │   └── ProtectedRoutes.jsx            ← Role protection HOC
│   ├── styles/
│   ├── utils/
│   │   └── auth.js                        ← Auth helpers
│   ├── assets/
│   ├── App.jsx                            ← Root component
│   ├── App.css
│   ├── main.jsx                           ← Entry point
│   └── index.css                          ← Tailwind imports
├── package.json                           ← Dependencies
├── vite.config.js                         ← Build config
├── tailwind.config.js                     ← Tailwind setup
├── postcss.config.js
└── index.html
```

---

## 🎨 DESIGN SYSTEM

### Color Palette
```
Primary:    Indigo    #6366F1
Secondary:  Purple    #A855F7
Success:    Emerald   #10B981
Warning:    Amber     #F59E0B
Alert:      Rose      #F43F5E
```

### Gradients by Page
```
Admin:         from-indigo-600 via-purple-600 to-indigo-700
User:          from-indigo-600 via-indigo-500 to-purple-600
Technician:    from-rose-600 via-rose-500 to-rose-600
Booking:       from-indigo-600 via-purple-600 to-indigo-700 (user)
               from-purple-600 via-purple-500 to-indigo-600 (admin)
```

### Typography
- Headers:   font-bold (700)
- Subtext:   text-sm (12px) or text-xs (10px)
- Body:      text-base (16px)
- Font:      System default (Tailwind ui-sans-serif)

### Spacing
- Card padding:    p-6 or p-8
- Input padding:   p-3
- Gap between:     gap-6
- Border radius:   rounded-2xl (cards), rounded-xl (inputs)

### Icons (React Icons - Feather set)
```
FiHome              ← Dashboard
FiBell              ← Notifications
FiCalendar          ← Bookings/Dates
FiClock             ← Time/Duration
FiCheckCircle       ← Success/Done
FiAlertCircle       ← Warning/Alert
FiBox               ← Resources
FiBriefcase         ← Purpose/Work
FiUsers             ← Users/People
FiTrash             ← Delete
FiEdit2             ← Edit
FiX                 ← Close/Cancel
FiActivity          ← Tasks/Work
```

---

## 📋 PAGE ROUTES

| Route | Component | Access | Title |
|-------|-----------|--------|-------|
| / | Login.jsx | Public | Login Page |
| /admin/dashboard | AdminDashbord.jsx | Admin | Admin Dashboard |
| /user/dashboard | UserDashboard.jsx | User | User Dashboard |
| /technician/dashboard | TechnicianDashboard.jsx | Technician | Technician Dashboard |
| /notifications | NotificationsPage.jsx | All | Notifications |
| /user/bookings | BookingUserPage.jsx | User | User Bookings |
| /admin/bookings | BookingAdminPage.jsx | Admin | Admin Bookings |
| /admin/resources | ResourcesAdminPage.jsx | Admin | Resource Management |

---

## 🔌 KEY API ENDPOINTS

```
GET    /user/me
GET    /resources?status=ACTIVE
GET    /resource-types
GET    /notifications
GET    /api/bookings?page=0&size=10&keyword=&status=
GET    /api/bookings/check-conflicts?resourceId=X&date=&startTime=&endTime=
POST   /api/bookings
PUT    /api/bookings/{id}
DELETE /api/bookings/{id}
PATCH  /api/bookings/{id}/cancel
PATCH  /api/bookings/{id}/approve
PATCH  /api/bookings/{id}/reject
POST   /resources
PUT    /resources/{id}
DELETE /resources/{id}
POST   /resource-types
PUT    /resource-types/{id}
DELETE /resource-types/{id}
GET    /api/admin/stats
```

---

## 📦 NPM DEPENDENCIES

```json
{
  "dependencies": {
    "axios": "^1.13.5",
    "dayjs": "^1.11.19",
    "jwt-decode": "^4.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.13.1",
    "react-toastify": "^11.0.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",
    "@tailwindcss/postcss": "^4.2.2",
    "autoprefixer": "^10.4.27",
    "postcss": "^8.5.9",
    "tailwindcss": "^4.2.2",
    "vite": "^7.3.1"
  }
}
```

---

## ⚙️ CONFIGURATION

### `src/config/runtime.js`
```javascript
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080/api/v1';
export const LOGOUT_URL = `${API_BASE_URL}/auth/logout`;
```

### `vite.config.js` (Include proxy)
```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

### `tailwind.config.js`
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: '#6366F1',
        purple: '#A855F7',
        emerald: '#10B981',
        amber: '#F59E0B',
        rose: '#F43F5E',
      }
    },
  },
  plugins: [],
}
```

---

## 🔐 AUTHENTICATION

### AuthContext Structure
```javascript
{
  user: { userId, email, name, role },
  isAuthenticated: boolean,
  loading: boolean,
  logout: () => void
}
```

### Protected Route
```javascript
<ProtectedRoute allowedRoles={["admin"]}>
  <AdminDashboard />
</ProtectedRoute>
```

### Axios with Credentials
```javascript
const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true  // ← REQUIRED for OAuth2 session
});
```

---

## 🚀 DEVELOPMENT WORKFLOW

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

---

## 🎯 KEY REQUIREMENTS

✅ All icons must use `react-icons/fi` (Feather set)  
✅ NO EMOJIS anywhere in the UI  
✅ All data fetched from backend API (NO dummy data)  
✅ Tailwind CSS for all styling  
✅ Apple-inspired minimalist design (clean borders, not heavy shadows)  
✅ Fully responsive (mobile-first)  
✅ Role-based access control (admin/user/technician)  
✅ Real-time form validation  
✅ Proper error handling with user-friendly messages  
✅ Loading states during API calls  

---

## 📝 FORM VALIDATION RULES

### Booking Form
- Resource: Required
- Date: Required, must be today or future date
- Start Time: Required, within resource availability window
- End Time: Required, must be after Start Time
- Purpose: Required, minimum 5 chars
- Attendees: Required (if resource has capacity), cannot exceed capacity
- Conflict Check: Before submission

### Resource Form
- Name: Required
- Type: Required (select from list)
- Location: Required
- Capacity: Optional, must be > 0 if provided
- Availability Start: Must be before End time
- Availability End: Must be after Start time
- Status: Required (ACTIVE, OUT_OF_SERVICE, MAINTENANCE)

---

## 🧪 MOCK API RESPONSES

### Success Response
```json
{
  "status": 200,
  "data": { ... },
  "message": "Success"
}
```

### Error Response
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed"
}
```

### Paginated Response
```json
{
  "content": [...],
  "page": 0,
  "size": 10,
  "totalElements": 45,
  "totalPages": 5
}
```

---

**Ready to share with Lovable AI! ✅**
