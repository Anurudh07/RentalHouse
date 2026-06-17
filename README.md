# RentalHouse 🏠

A premium, production-ready full-stack Property Rental Platform built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js). 

It features dynamic, role-based dashboards for **Tenants**, **Owners**, and **Admins**, advanced filtering & search tools, side-by-side property comparisons, interactive maps, secure authentication, automated email notifications, and support for local or cloud image uploads.

---

## 🎨 Design & Aesthetic Features
- **Modern Theme System**: Real-time Light & Dark mode support leveraging clean HSL-based stylesheets.
- **Visual Polish**: Built using Bootstrap 5 layout grids, styled with customized modern overlays, glassmorphic container cards, smooth hover effects, micro-animations, and custom scrollbars.
- **Interactive OpenStreetMap**: Real-time maps integrated using **Leaflet** (OpenStreetMap) to provide responsive maps without requiring paid Google Maps API keys.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- Secure registration and login using **JSON Web Tokens (JWT)** and **Bcrypt.js** password hashing.
- Role-based Route Guarding (`Tenant`, `Owner`, `Admin`) preventing unauthorized access to restricted dashboards.

### 👤 Tenant Dashboard
- **Advanced Search & Filtering**: Filter listings by location/city, monthly rent range, BHK size, bathrooms, property types, and specific amenities.
- **Property Comparison**: Side-by-side comparison of up to 3 properties comparing rent, deposit, sizes, and features.
- **Bookings & Inquiries**: Request visits/bookings and directly message owners through a custom Inquiry Form.
- **Wishlist & Reviews**: Toggle properties as favorites and post ratings and feedback reviews.

### 💼 Owner Dashboard
- **Platform Analytics**: Check total listings, active rental inquiries, and pending visits directly from custom widgets.
- **Listing Management**: Add, edit, or delete property listings with image previews and dynamic form controls.
- **Inquiry & Booking Manager**: Approve or reject booking requests and view incoming tenant messages.

### 👑 Admin Dashboard
- **Moderate Listings**: View and delete platform-wide listings.
- **User Management**: Search, monitor, block, or unblock user accounts dynamically.
- **Analytical Charts**: Platform registration trends and rental metrics visualized through **Recharts** charts.

---

## 🛠️ Technology Stack

| **Frontend** | **Backend** |
| :--- | :--- |
| React 18 (Vite) | Node.js & Express.js |
| React Router DOM v6 | MongoDB (Mongoose ODM) |
| Axios (with automatic token interceptors) | JSON Web Token (JWT) |
| Bootstrap 5 + Custom CSS | Multer (File upload handler) |
| Leaflet & React-Leaflet (OSM maps) | Cloudinary API (Cloud storage) |
| Recharts (Data visualization graphs) | Nodemailer (Email notification engine) |
| Lucide React (Icons library) | Bcrypt.js (Password encryption) |

---

## 📁 Project Structure

```
RentalHouse/
├── client/                 # React Frontend (Vite)
│   ├── public/             # SVGs, assets, icons
│   ├── src/
│   │   ├── api/            # Axios API config
│   │   ├── components/     # Reusable UI components (Navbar, Cards, Filters)
│   │   ├── context/        # Global States (Auth, Theme, Favorites, Properties)
│   │   ├── layouts/        # Layout wrappers (Dashboards)
│   │   ├── pages/          # Public and role-based views
│   │   ├── styles/         # Custom stylesheet overrides & design system
│   │   ├── App.jsx         # Core Routing & Context Bindings
│   │   └── main.jsx        # App mounting configuration
│   └── package.json
│
├── server/                 # Express Backend (Node.js)
│   ├── config/             # DB & Cloud storage setups
│   ├── controllers/        # Route logic controllers
│   ├── middleware/         # Route guards, error handling, file parsing
│   ├── models/             # Mongoose Schemas (User, Property, Booking, Review, etc.)
│   ├── routes/             # REST Endpoints
│   ├── scripts/            # Database seeder scripts
│   ├── services/           # Mailer & local file storage managers
│   ├── uploads/            # Local disk storage fallback for images
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v16.x or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a running local MongoDB instance

---

### Step 1: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d

   # Cloudinary (Optional - system falls back to server/uploads/ directory automatically if blank)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # SMTP Configurations (Optional - system prints output to console + falls back to Ethereal if blank)
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   EMAIL_FROM=RentalHouse <noreply@rentalhouse.com>
   ```
4. **Seed the Database** (Recommended): Populate the database with 30+ mock properties, 10 owners, 20 tenants, reviews, and favorites:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

---

### Step 2: Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install the client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React client:
   ```bash
   npm run dev
   ```
   The frontend server will spin up at `http://localhost:3000` (automatically proxies request endpoints to the backend on `5000`).

---

## 🤝 Fallback Mechanisms & Graceful Degradation
To run this application locally without setting up third-party services, we built the following fallbacks directly into the core:
1. **Local Images Storage**: If Cloudinary keys are empty in `.env`, uploaded property images are automatically saved to `server/uploads/` and served locally.
2. **Email Console Logger**: If SMTP configurations are omitted, registrations and inquiry alerts are printed directly to the server terminal console for testing.
