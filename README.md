# 🚑 Ambulance Pondok Bambu

Aplikasi manajemen layanan ambulans untuk **PT Waschen Alora Indonesia** — mengelola transaksi perjalanan, daftar harga, stok barang (kain kafan), dan pencatatan keuangan.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS, React Router, Recharts, Lucide Icons |
| Backend | Express.js, MySQL2, JWT, bcryptjs |
| Database | MySQL (MariaDB) |
| Tooling | Nodemon, Concurrently, PostCSS, Autoprefixer |

---

## 📁 Project Structure

```
Ambulance-New/
├── api/
│   ├── controllers/     # Logic per modul (auth, barang, harga, keuangan, transaksi)
│   ├── db/              # Koneksi database (mysql2 pool)
│   ├── middleware/       # Auth middleware (JWT verification)
│   ├── migrations/      # SQL migration files
│   └── routes/          # Route definitions
├── src/
│   ├── components/      # Layout, Sidebar, Topbar
│   ├── pages/           # Halaman utama (Login, Dashboard, Barang, Harga, Keuangan, Transaksi)
│   ├── utils/           # API helper & utility functions
│   ├── App.jsx          # Router config
│   └── main.jsx         # Entry point
├── server.js            # Express server entry point
├── vite.config.js       # Vite config (proxy /api → backend)
└── .env                 # Environment variables (not committed)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MySQL / MariaDB** database
- **npm** atau **yarn**

### 1. Clone & Install

```bash
git clone <repository-url>
cd Ambulance-New
npm install
```

### 2. Setup Database

Create the database and run the migration:

```bash
mysql -u <user> -p < api/migrations/001_init.sql
```

### 3. Environment Variables

Copy and edit `.env`:

```env
# Server
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASS=your_password
DB_NAME=naturech_ambulance

# Auth
SESSION_SECRET=your-secret-key
```

### 4. Run Development Server

```bash
npm run dev
```

This starts **both** the backend (Express on port 3001) and frontend (Vite on port 5173) concurrently.

| Mode | Command | Description |
|------|---------|-------------|
| Full stack | `npm run dev` | Backend + Frontend concurrently |
| Backend only | `npm run dev:server` | Express server (port 3001) |
| Frontend only | `npm run dev:client` | Vite dev server (port 5173) |

---

## 📦 Build & Production

```bash
npm run build
npm start
```

In production mode, Express serves the static build from `dist/` on port 3001.

---

## 🔑 Default Credentials

After running the seed migration, login with:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

> ⚠️ Change the default password immediately after first login.

---

## 📋 Features

- **Dashboard** — Ringkasan transaksi, statistik keuangan, dan grafik
- **Transaksi Ambulans** — CRUD perjalanan dengan detail pasien, rute, dan harga
- **Daftar Harga** — Master harga layanan per wilayah dan kota tujuan
- **Manajemen Stok** — Data barang kain kafan, pemakaian, dan restock
- **Keuangan** — Pencatatan pemasukan dan pengeluaran kas
- **Authentication** — Login/JWT-based auth dengan role admin

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/barang` | List barang |
| POST | `/api/barang` | Add barang |
| PUT | `/api/barang/:id` | Update barang |
| DELETE | `/api/barang/:id` | Delete barang |
| POST | `/api/barang/pemakaian` | Catat pemakaian |
| POST | `/api/barang/restock` | Restock barang |
| GET | `/api/harga` | List harga |
| GET | `/api/keuangan` | List keuangan |
| GET | `/api/transaksi` | List transaksi |

> All endpoints (except login) require `Authorization: Bearer <token>` header.

---

## 📄 License

Private — PT Waschen Alora Indonesia
