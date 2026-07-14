# DispatchNG — Real-time Logistics Matching System

**Caritas University Final Year Project**  
**Student:** Eziokwu Chiamaka Vera  
**Case Study:** GIG Logistics, Enugu Branch

---

## Overview

DispatchNG is a mobile-first PWA (Progressive Web App) that connects customers with verified dispatch riders for real-time package delivery tracking in Enugu.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Icons      | Lucide React                        |
| Maps       | Leaflet.js + OpenStreetMap          |
| Real-time  | Socket.io                           |
| Backend    | Node.js + Express.js                |
| Database   | SQLite (via sql.js)                 |
| Auth       | JWT + bcryptjs                      |
| PWA        | vite-plugin-pwa + Workbox           |

---

## Design System

- **Off-white** `#F5F5F0` — background
- **Jet black** `#141414` — primary text, sidebar
- **Gray** `#6B6B6B` — secondary text
- **Red** `#E03131` — accent, actions, brand
- **Fonts:** DM Sans (headings) + Inter (body)

---

## Project Structure

```
dispatch-ng/
├── backend/
│   ├── controllers/        # Auth, delivery, rider, notification logic
│   ├── db/                 # Schema init, database helper
│   ├── middleware/         # JWT auth, role guard
│   ├── routes/             # Express route definitions
│   ├── sockets/            # Socket.io location handler
│   ├── .env                # Environment variables
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # AppShell (bottom nav + sidebar)
│   │   │   └── ui/         # Button, Card, Badge, Spinner, etc.
│   │   ├── context/        # AuthContext (global state)
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── customer/   # Dashboard, RequestDelivery, TrackDelivery
│   │   │   ├── rider/      # Dashboard, Jobs, ActiveDelivery
│   │   │   └── admin/      # Dashboard, Deliveries, Riders, Users
│   │   ├── services/       # api.js (axios), socket.js
│   │   └── main.jsx
│   └── vite.config.js
```

---

## Setup & Run

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## Default Credentials

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@dispatchng.com     | Admin@123 |

Register new Customer and Rider accounts from the app.

---

## User Roles & Features

### Customer
- Register / login
- Create delivery request (pickup, destination, recipient, priority)
- GPS location capture for accurate coordinates
- Live map tracking with Leaflet + OpenStreetMap
- Real-time rider location via Socket.io
- Delivery history and status trail
- Notifications for all delivery events

### Rider
- Register / login
- Toggle availability (online/offline)
- Browse and accept available delivery jobs
- Active delivery view with live GPS tracking
- Push location to customer in real time (browser GPS)
- Advance delivery status (assigned → picked up → in transit → delivered)

### Admin
- Full overview dashboard with stats
- Browse all deliveries with filters and search
- Manage all riders (view stats, suspend/activate)
- Manage all users (customers + riders)

---

## API Endpoints

### Auth
| Method | Route           | Access  |
|--------|-----------------|---------|
| POST   | /api/auth/register | Public |
| POST   | /api/auth/login    | Public |
| GET    | /api/auth/me       | Auth   |

### Deliveries
| Method | Route                        | Access   |
|--------|------------------------------|----------|
| POST   | /api/deliveries              | Customer |
| GET    | /api/deliveries/my           | Customer |
| GET    | /api/deliveries/track/:code  | Public   |
| GET    | /api/deliveries/available    | Rider    |
| GET    | /api/deliveries/rider        | Rider    |
| PATCH  | /api/deliveries/:id/accept   | Rider    |
| PATCH  | /api/deliveries/:id/status   | Rider    |
| GET    | /api/deliveries              | Admin    |
| GET    | /api/deliveries/stats        | Admin    |

### Riders
| Method | Route                         | Access |
|--------|-------------------------------|--------|
| PATCH  | /api/riders/availability      | Rider  |
| PATCH  | /api/riders/location          | Rider  |
| GET    | /api/riders                   | Admin  |
| GET    | /api/riders/users             | Admin  |
| PATCH  | /api/riders/users/:id/toggle  | Admin  |

### Socket Events
| Event                  | Direction         | Description                  |
|------------------------|-------------------|------------------------------|
| rider:location         | Rider → Server    | Push GPS coords              |
| watch:delivery         | Customer → Server | Subscribe to delivery updates|
| delivery:location      | Server → Customer | Real-time rider position     |
| delivery:status_update | Server → Customer | Status change notification   |
| delivery:status        | Rider → Server    | Update status via socket     |

---

## PWA Features

- Installable on iOS and Android (Add to Home Screen)
- Offline-capable (service worker caching)
- Mobile-first responsive layout
- Bottom navigation on mobile (< 768px)
- Collapsible sidebar on tablet (768px–1024px)  
- Persistent sidebar on desktop (> 1024px)
- Safe area support for notched phones

---

*Built for Caritas University, Department of Computer Science, 2024.*
