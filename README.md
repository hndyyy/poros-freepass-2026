# TaskFlow AI

Aplikasi manajemen task berbasis web full-stack dengan arsitektur microservices yang di-deploy menggunakan Docker dan CI/CD pipeline otomatis melalui GitHub Actions.

---

## 📋 Daftar Isi

- [Penjelasan Arsitektur Aplikasi](#-penjelasan-arsitektur-aplikasi)
- [Diagram Arsitektur](#-diagram-arsitektur)
- [Struktur Repository](#-struktur-repository)
- [Penjelasan Alur CI/CD](#-penjelasan-alur-cicd)
- [Cara Menjalankan Sistem Secara Manual](#-cara-menjalankan-sistem-secara-manual)

---

## 🏗 Penjelasan Arsitektur Aplikasi

TaskFlow AI menggunakan arsitektur **3-tier microservices** yang terdiri dari tiga komponen utama yang masing-masing berjalan dalam container Docker terpisah:

### 1. Frontend (React + Vite + Nginx)

| Aspek | Detail |
|-------|--------|
| **Framework** | React 18 dengan TypeScript |
| **Build Tool** | Vite 5 |
| **Web Server** | Nginx 1.26 (Alpine) |
| **Styling** | Lucide React (icons), clsx, tailwind-merge |
| **Port** | `80` (dalam container) |

Frontend di-build menggunakan **multi-stage Docker build**:
- **Stage 1 (Builder)**: Node.js mengompilasi source code React/TypeScript menjadi file statis menggunakan Vite.
- **Stage 2 (Production)**: Nginx menyajikan file statis hasil build ke browser pengguna.

Komponen utama frontend:
- `App.tsx` — Komponen utama aplikasi
- `LoginForm.tsx` — Form login pengguna
- `SignUp.tsx` — Form registrasi pengguna
- `TaskForm.tsx` — Form untuk membuat/mengedit task
- `TaskList.tsx` — Daftar task dengan filter dan manajemen

Frontend berkomunikasi dengan backend melalui REST API menggunakan `fetch()`, dengan base URL yang dikonfigurasi melalui environment variable `VITE_API_URL`.

### 2. Backend (Express.js + Prisma ORM)

| Aspek | Detail |
|-------|--------|
| **Runtime** | Node.js 24 (Alpine) |
| **Framework** | Express.js 4 |
| **ORM** | Prisma 5 |
| **Bahasa** | TypeScript |
| **Port** | `3000` |

Backend menyediakan REST API dengan endpoint berikut:

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/health` | Health check (status, uptime, timestamp) |
| `POST` | `/api/auth/signup` | Registrasi pengguna baru |
| `POST` | `/api/auth/login` | Login pengguna |
| `GET` | `/api/tasks` | Mendapatkan semua task |
| `POST` | `/api/tasks` | Membuat task baru |
| `PUT` | `/api/tasks/:id` | Mengupdate task |
| `DELETE` | `/api/tasks/:id` | Menghapus task |

Fitur keamanan:
- Password di-hash menggunakan **bcryptjs** sebelum disimpan ke database
- Validasi input pada setiap endpoint
- CORS enabled untuk komunikasi cross-origin

### 3. Database (MySQL 8.0)

| Aspek | Detail |
|-------|--------|
| **Engine** | MySQL 8.0 |
| **Auth Plugin** | `mysql_native_password` |
| **Port** | Dikonfigurasi via environment variable |

Schema database dikelola oleh Prisma dengan dua model utama:

- **User** — `id`, `email` (unique), `password` (hashed), `name`, `createdAt`, `updatedAt`
- **Task** — `id`, `title`, `description`, `status`, `priority`, `createdAt`, `dueDate`, `userId` (foreign key ke User)

Relasi: Satu User memiliki banyak Task (one-to-many).

### Komunikasi Antar Service

Semua service terhubung melalui Docker network bernama `taskflow_network` (bridge driver). Backend mengakses database menggunakan hostname `database` (nama service di docker-compose), bukan IP langsung.

---

## 📊 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DOCKER HOST (Server)                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   taskflow_network (bridge)                  │   │
│  │                                                              │   │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐ │   │
│  │  │   Frontend   │   │   Backend    │   │    Database      │ │   │
│  │  │              │   │              │   │                  │ │   │
│  │  │  Nginx:80    │   │ Express:3000 │   │   MySQL:3306     │ │   │
│  │  │  (React SPA) │──▶│ (REST API)   │──▶│   (Prisma ORM)  │ │   │
│  │  │              │   │              │   │                  │ │   │
│  │  └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘ │   │
│  │         │                  │                     │           │   │
│  └─────────┼──────────────────┼─────────────────────┼───────────┘   │
│            │                  │                     │               │
│      :FRONTEND_PORT      :PORT                 :DB_PORT            │
│            │                  │                     │               │
└────────────┼──────────────────┼─────────────────────┼───────────────┘
             │                  │                     │
       ┌─────▼─────┐     ┌─────▼─────┐         ┌─────▼─────┐
       │  Browser   │     │ API Client│         │ DB Client │
       │  (User)    │     │ (Optional)│         │ (Optional)│
       └───────────┘     └───────────┘         └───────────┘
```

### Alur Request

```
Browser ──HTTP──▶ Nginx (:FRONTEND_PORT)
                    │
                    ├── Serve static files (React SPA)
                    │
Browser ──HTTP──▶ Backend (:PORT/api/*)
                    │
                    ├── Express.js memproses request
                    ├── Prisma ORM melakukan query
                    │
                    ▼
               MySQL Database
```

---

## 📁 Struktur Repository

```
poros-freepass/
├── .github/
│   └── workflows/
│       └── main.yml                 # GitHub Actions CI/CD pipeline
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/              # Database migration files
│   │   └── schema.prisma            # Prisma schema (User & Task models)
│   ├── src/
│   │   ├── routes.ts                # API endpoints (auth, tasks, health)
│   │   ├── server.ts                # Express server entry point
│   │   └── types.ts                 # TypeScript type definitions
│   ├── dist/                        # Compiled JavaScript output
│   ├── .env.example                 # Template environment variables
│   ├── Dockerfile                   # Backend Docker image (Node.js)
│   ├── package.json                 # Dependencies & scripts
│   └── tsconfig.json                # TypeScript configuration
│
├── frontend/
│   ├── components/
│   │   ├── LoginForm.tsx            # Login form component
│   │   ├── SignUp.tsx               # Sign up form component
│   │   ├── TaskForm.tsx             # Task create/edit form
│   │   └── TaskList.tsx             # Task list with filtering
│   ├── services/
│   │   ├── authService.ts           # Authentication API calls
│   │   └── taskService.ts           # Task CRUD API calls
│   ├── nginx/
│   │   └── default                  # Nginx config for serving SPA
│   ├── App.tsx                      # Root application component
│   ├── index.tsx                    # React entry point
│   ├── index.html                   # HTML template
│   ├── types.ts                     # Shared TypeScript types
│   ├── vite.config.ts               # Vite build configuration
│   ├── .env.example                 # Template environment variables
│   ├── Dockerfile                   # Frontend Docker image (multi-stage)
│   ├── package.json                 # Dependencies & scripts
│   └── tsconfig.json                # TypeScript configuration
│
├── docker-compose.yml               # Docker Compose orchestration
└── .gitignore                       # Git ignore rules
```

---

## 🔄 Penjelasan Alur CI/CD

CI/CD pipeline berjalan otomatis setiap kali ada **push ke branch `main`** menggunakan **GitHub Actions** dengan **self-hosted runner**. Pipeline terdiri dari 4 job yang berjalan secara berurutan (sequential):

```
 ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐
 │  BUILD  │────▶│  TEST   │────▶│  PUSH   │────▶│  DEPLOY  │
 └─────────┘     └─────────┘     └─────────┘     └──────────┘
```

### Job 1: Build

| Step | Deskripsi |
|------|-----------|
| **Clone Code** | Checkout repository menggunakan `actions/checkout@v3` |
| **Login Docker** | Login ke Docker Hub registry |
| **Create .env** | Membuat file `.env` untuk backend dan frontend dari GitHub Secrets |
| **Build Backend** | Build Docker image backend (`no-cache`) dan load ke lokal |
| **Build Frontend** | Build Docker image frontend (`no-cache`) dengan `VITE_API_URL` sebagai build-arg |

> Image di-build dengan `no-cache: true` untuk memastikan selalu menggunakan kode terbaru.

### Job 2: Test

| Step | Deskripsi |
|------|-----------|
| **Start Services** | Menjalankan backend + database via `docker compose up -d backend` |
| **Wait** | Menunggu 15 detik untuk startup |
| **Health Check** | Melakukan `curl` ke `http://localhost:3000/api/health` |
| **Cleanup** | Menghentikan semua container setelah test |

Jika health check gagal, job akan menampilkan log backend dan menghentikan pipeline.

### Job 3: Push

| Step | Deskripsi |
|------|-----------|
| **Login Docker** | Login ulang ke Docker Hub |
| **Push Backend** | Build ulang & push image backend ke registry |
| **Push Frontend** | Build ulang & push image frontend ke registry |
| **Cleanup** | Membersihkan image dan cache Docker lokal |

### Job 4: Deploy

| Step | Deskripsi |
|------|-----------|
| **Clone Code** | Checkout repository untuk mendapatkan `docker-compose.yml` terbaru |
| **Pull Images** | Menarik image terbaru dari registry (`docker compose pull`) |
| **Deploy** | Menjalankan semua service di remote server via Docker Context (`docker --context remote-client compose up -d`) |

### Failure Handling

Setiap job memiliki step **Failure Cleanup** yang berjalan otomatis jika terjadi kegagalan:
- Menghentikan semua container (`docker compose down`)
- Menghapus semua image yang tidak terpakai (`docker image prune -a -f`)
- Membersihkan build cache (`docker builder prune -f`)

### GitHub Secrets yang Diperlukan

| Secret | Deskripsi |
|--------|-----------|
| `DOCKER_USERNAME` | Username Docker Hub |
| `DOCKER_PASSWORD` | Password/token Docker Hub |
| `BACKEND_IMAGE_TAG` | Tag image backend (e.g., `user/taskflow-backend:latest`) |
| `FRONTEND_IMAGE_TAG` | Tag image frontend (e.g., `user/taskflow-frontend:latest`) |
| `VITE_API_URL` | URL API backend untuk frontend (e.g., `http://IP:3000/api`) |
| `PORT` | Port backend (e.g., `3000`) |
| `FRONTEND_PORT` | Port frontend (e.g., `80`) |
| `DB_HOST` | Hostname database |
| `DB_USER` | Username database |
| `DB_PASSWORD` | Password database |
| `DB_NAME` | Nama database |
| `DB_PORT` | Port database (e.g., `3306`) |
| `DATABASE_URL` | Full connection string MySQL |

---

## 🚀 Cara Menjalankan Sistem Secara Manual

### Prasyarat

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) terinstal
- [Node.js](https://nodejs.org/) v20+ (untuk development lokal tanpa Docker)
- [Git](https://git-scm.com/)

### Opsi 1: Menggunakan Docker Compose (Direkomendasikan)

#### 1. Clone repository

```bash
git clone https://github.com/<username>/poros-freepass.git
cd poros-freepass
```

#### 2. Buat file environment

**Backend** (`backend/.env`):
```env
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=database
DB_PORT=3306
DB_NAME=taskflow
DATABASE_URL=mysql://root:your_password@database:3306/taskflow
PORT=3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

#### 3. Build Docker images

```bash
# Build backend
docker build -t taskflow-backend ./backend

# Build frontend (dengan build-arg untuk API URL)
docker build -t taskflow-frontend \
  --build-arg VITE_API_URL=http://localhost:3000/api \
  ./frontend
```

#### 4. Jalankan semua services

```bash
# Set environment variables
export BACKEND_IMAGE=taskflow-backend
export FRONTEND_IMAGE=taskflow-frontend
export DB_PASSWORD=your_password
export DB_NAME=taskflow
export DB_USER=root
export DB_HOST=database
export DB_PORT=3306
export DATABASE_URL=mysql://root:your_password@database:3306/taskflow
export PORT=3000
export FRONTEND_PORT=8080

# Jalankan
docker compose up -d
```

#### 5. Jalankan migrasi database

```bash
# Masuk ke container backend
docker exec -it <backend_container_id> sh

# Jalankan migrasi Prisma
npx prisma migrate deploy
```

#### 6. Akses aplikasi

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:8080` |
| Backend API | `http://localhost:3000/api` |
| Health Check | `http://localhost:3000/api/health` |

---

### Opsi 2: Development Lokal (Tanpa Docker)

#### 1. Setup Database

Pastikan MySQL 8.0 berjalan di mesin lokal Anda.

```sql
CREATE DATABASE taskflow;
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
# Edit .env sesuai konfigurasi database lokal Anda
# DB_HOST harus 'localhost' untuk development lokal

# Generate Prisma client
npx prisma generate

# Jalankan migrasi
npx prisma migrate dev

# Jalankan server (development mode)
npm run dev
```

Backend akan berjalan di `http://localhost:3000`.

#### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000/api

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` (default Vite) dengan proxy otomatis ke backend.

---

### Menghentikan Sistem

```bash
# Jika menggunakan Docker Compose
docker compose down

# Untuk menghapus volume database juga (HATI-HATI: data akan hilang!)
docker compose down -v
```
