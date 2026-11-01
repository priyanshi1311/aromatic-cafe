# 🌸 Aromatic — QR-Based Restaurant Booking System & Admin CRM Panel


## 🌐 Live Deployment Links

| Resource | Live Link |
| :--- | :--- |
| **🚀 Live Customer Website (Vercel)** | [https://aromatic-cafe-1vy2-delta.vercel.app/](https://aromatic-cafe-1vy2-delta.vercel.app/) |
| **🔐 Admin & CRM Portal** | [https://aromatic-cafe-1vy2-delta.vercel.app/admin/login](https://aromatic-cafe-1vy2-delta.vercel.app/admin/login) |
| **⚡ Backend API (Render)** | [https://aromatic-cafe.onrender.com/](https://aromatic-cafe.onrender.com/) |
| **📦 GitHub Repository** | [https://github.com/priyanshi1311/aromatic-cafe](https://github.com/priyanshi1311/aromatic-cafe) |
| **💬 Restaurant WhatsApp Helpline**
### 🔑 Testing Credentials (Admin Portal)
* **URL**: [https://aromatic-cafe-1vy2-delta.vercel.app/admin/login](https://aromatic-cafe-1vy2-delta.vercel.app/admin/login)
* **Email**: `admin@aromatic.com`
* **Password**: `Admin@123`

---

## 📌 1. Project Overview

**Aromatic** is a full-stack, production-ready table reservation and lightweight customer relationship management (CRM) platform designed specifically for experiential dining cafes and restaurants.

### The Problem it Solves:
Traditional restaurants rely on manual phone calls or fragmented WhatsApp chats, leading to double-bookings, missed calls during rush hours, lack of customer retention records, and poor visibility. Customers also dislike having to download native apps just to book a table.

### The Solution:
- **Instant QR Booking**: Customers scan a table QR or restaurant poster QR on their mobile browser and book in under 45 seconds without creating an account or downloading an app.
- **Double-Booking Prevention**: Backend guarantees real-time slot checking across active table capacities and time slots.
- **Lightweight Admin CRM**: Tracks every guest's visit count, past dining logs, loyalty tags (`👑 VIP`, `🌸 Regular`, `⛔ Blacklisted`), and staff internal preferences/notes.
- **Interactive Calendar & WhatsApp Integration**: Features a live monthly calendar booking view, one-click WhatsApp confirmation vouchers directly sent, and full CSV exports.

---

## ✨ 2. Key Features List

### 📱 2.1 Customer Facing (Mobile-First & QR Driven)
* **QR Code Landing**: Scannable restaurant poster QR (`/book`) or dedicated per-table QR (`/book?table=<tableId>`) which auto-selects the customer's table.
* **Party Packages & Event Inquiries**: Integrated package links from the showcase into booking inquiries (`/book?package=<packageName>`).
* **Live Availability Engine**: Dynamically displays only unbooked time slots and tables with sufficient capacity for the chosen party size and dining date.
* **Smart Validation**: Blocks past dates, enforces operational opening/closing hours, validates Indian 10-digit / international phone numbers, and checks table capacity.
* **Digital Reservation Voucher**: Instant confirmation screen with unique booking ID (e.g., `AROM-XXXXXX`), table number, date, time slot, and print-ready pass.
* **[BONUS] WhatsApp Confirmation**: One-click button on confirmation screen to send and share booking details directly to the restaurant WhatsApp helpline with pre-composed text.

### 🛡️ 2.2 Admin Panel & Management
* **Secure JWT Authentication**: Protected admin routes with bcrypt-hashed passwords and stateless token verification.
* **Interactive Dashboard**: Real-time stats for Today's Bookings, Total Guests, Completed Visits, Cancellations, and a visual status distribution bar.
* **[BONUS] Calendar View of Bookings**: Month-by-month interactive calendar view showing reservation badges per day with an instant day-agenda drawer.
* **Booking Manager**: Filter reservations by date, status, or search query. Update statuses (`Pending`, `Confirmed`, `Seated`, `Completed`, `Cancelled`, `No-show`).
* **[BONUS] Admin WhatsApp Dispatch**: One-click button inside reservation modal for staff to trigger direct WhatsApp booking confirmations to guests.
* **Table Management**: Add, edit, and toggle active/inactive status and capacities for dining tables.
* **QR Code Center**: Generate, preview, and download high-resolution PNG QR codes for individual tables or the entire restaurant.
* **Settings & Holiday Management**: Configure operating hours (11:00 AM – 11:00 PM), slot duration (90 mins), and add blocked dates (holidays).
* **[BONUS] CSV Data Exports**: One-click CSV downloads for all reservations and customer CRM records.

### 👥 2.3 Customer CRM
* **Auto-Created Guest Profiles**: Every new reservation automatically syncs into the guest CRM.
* **Loyalty Tags**: Tag guests as `👑 VIP`, `🌸 Regular`, or `⛔ Blacklisted`.
* **Complete Visit History**: Detailed profile modal listing all past reservations, tables seated, party sizes, and custom requests.
* **Staff CRM Notes**: Track customer dining preferences (e.g., "allergic to nuts, anniversary in November, prefers rooftop table").

---

## 🛠️ 3. Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM 7, Tailwind CSS, Axios, react-qrcode-logo, react-hot-toast, Lodash |
| **Backend** | Node.js, Express.js (RESTful API Architecture) |
| **Database** | MongoDB with Mongoose ODM (MongoDB Atlas Cloud Cluster) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js password hashing |
| **Hosting** | Vercel (Frontend CDN) + Render (Node.js API & Full-Stack fallback) |
| **Code Structure** | Monorepo structure with decoupled `/client` and `/server` |

---

## 🚀 4. Setup & Local Installation Guide

### Prerequisites
* **Node.js** (v18.x or higher)
* **MongoDB** (Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI)
* **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/priyanshi1311/aromatic-cafe.git
cd aromatic-cafe
```

### Step 2: Install Dependencies
Install dependencies for both server and client:
```bash
# Install root, backend and frontend dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### Step 3: Configure Environment Variables

1. **Backend `.env`** (create `server/.env` or copy from `server/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/restaurant_booking?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_aromatic_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development

RESTAURANT_NAME=Aromatic
RESTAURANT_BASE_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

ADMIN_EMAIL=admin@aromatic.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Aromatic Admin
```

2. **Frontend `.env`** (create `client/.env` or leave blank for local development proxy):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 4: Seed Initial Admin Account
Run the database seed script to initialize the admin manager (or server auto-seeds on first boot):
```bash
node server/scripts/seedAdmin.js
```

### Step 5: Start the Application

**Run concurrently in two terminals:**
```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend Vite App (port 5173)
npm run dev:client
```

Open your browser at `http://localhost:5173` to view the website, or `http://localhost:5173/admin/login` for the staff portal.

---

## 🔑 5. Admin Login Credentials for Testing

| Credential | Value |
| :--- | :--- |
| **Live Admin Portal URL** | `https://aromatic-cafe-1vy2-delta.vercel.app/admin/login` |
| **Local Admin Portal URL** | `http://localhost:5173/admin/login` |
| **Email** | `admin@aromatic.com` |
| **Password** | `Admin@123` |
| **Role** | Super Admin / Cafe Manager |

*(Passwords are securely hashed with bcrypt salt rounds in MongoDB).*

---

## 🗺️ 6. Feature-to-File Map

| Feature / Responsibility | Client Files (Frontend) | Server Files (Backend) |
| :--- | :--- | :--- |
| **QR Code Table Scans & Routing** | `client/src/pages/public/BookingPage.jsx`<br>`client/src/pages/admin/QRPage.jsx` | `server/controllers/tableController.js`<br>`server/routes/tableRoutes.js` |
| **Slot Checking & Live Availability** | `client/src/pages/public/BookingPage.jsx`<br>`client/src/services/index.js` | `server/controllers/bookingController.js`<br>`server/utils/slotUtils.js` |
| **Booking Creation & Prevention of Double-Booking** | `client/src/pages/public/BookingPage.jsx` | `server/controllers/bookingController.js` (`createBooking`)<br>`server/models/Booking.js` |
| **Booking Success Pass & WhatsApp Voucher** | `client/src/pages/public/BookingSuccess.jsx` | `server/controllers/bookingController.js` (`getBookingConfirmation`) |
| **Admin Authentication (JWT)** | `client/src/pages/admin/LoginPage.jsx`<br>`client/src/context/AuthContext.jsx`<br>`client/src/components/ProtectedRoute.jsx` | `server/controllers/authController.js`<br>`server/middleware/auth.js`<br>`server/models/Admin.js` |
| **Admin Dashboard & Pipeline Analytics** | `client/src/pages/admin/Dashboard.jsx` | `server/controllers/bookingController.js` (`getDashboardStats`) |
| **Calendar View of Bookings (Bonus)** | `client/src/pages/admin/BookingsPage.jsx` (`BookingCalendarView`) | `server/controllers/bookingController.js` (`getBookings`) |
| **Table Management & QR Code Downloads** | `client/src/pages/admin/TablesPage.jsx`<br>`client/src/pages/admin/QRPage.jsx` | `server/controllers/tableController.js`<br>`server/models/Table.js` |
| **Customer CRM, History & Tags (Bonus)** | `client/src/pages/admin/CustomersPage.jsx`<br>`client/src/components/CustomerRow.jsx` | `server/controllers/customerController.js`<br>`server/models/Customer.js` |
| **CSV Exports (Bookings & Customers)** | `client/src/pages/admin/BookingsPage.jsx`<br>`client/src/pages/admin/CustomersPage.jsx` | `server/controllers/bookingController.js` (`exportBookingsCSV`)<br>`server/controllers/customerController.js` (`exportCustomersCSV`) |
| **Operational Hours & Blocked Dates** | `client/src/pages/admin/SettingsPage.jsx` | `server/controllers/settingsController.js`<br>`server/models/Settings.js` |

---

## 🏆  FEATURES
1. ✅ **WhatsApp Booking Confirmation**: Integrated on both the public voucher screen (`BookingSuccess.jsx`) and the admin management modal (`BookingsPage.jsx`) .
2. ✅ **Calendar View in Admin Panel**: Added a monthly interactive calendar view toggle alongside the standard table view.
3. ✅ **Full Customer CRM**: Tagging (`VIP`, `Regular`, `Blacklisted`), custom staff notes, visit counts, and complete past dining history records.
4. ✅ **Dual CSV Exports**: CSV data export implemented for both Reservations and Customer directory.
5. ✅ **Live Analytics Visualization**: Progress bar distribution of booking statuses on the admin dashboard.
6. ✅ **Deployed Live Version with Working QR Codes**: Live on Vercel & Render with live MongoDB Atlas connection.

---

© 2026 Aromatic Cafe & Restaurant.
