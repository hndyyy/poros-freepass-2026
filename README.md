# TaskFlow AI

A full-stack task management application with a React frontend and Node.js/Express backend.

## 🏗️ Architecture

The application follows a standard Client-Server architecture:

-   **Frontend**: Built with **React** (Vite), using **Tailwind CSS** for styling and **Lucide React** for icons. It communicates with the backend via REST APIs.
-   **Backend**: Built with **Node.js** and **Express**, written in **TypeScript**. It handles business logic, authentication, and communicates with the database using **Prisma ORM**.
-   **Database**: **MySQL** database for storing users and tasks.

### Architecture Diagram

```mermaid
graph TD
    User[User] -->|Browser| Frontend[Frontend (React)]
    Frontend -->|REST API| Backend[Backend (Node.js/Express)]
    Backend -->|Prisma| DB[(MySQL Database)]
    Backend -->|Auth| Auth[Bcrypt Authentication]
```

## 🚀 Getting Started (Manual Setup)

### Prerequisites

-   Node.js (v18+)
-   Docker & Docker Compose (for Database) OR local MySQL server

### 1. Database Setup

Ensure you have a MySQL instance running. You can use the provided `docker-compose.yml` to start a database:

```bash
docker compose up -d mysql
```

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Copy `.env.example` to `.env` and update the values (DB connection, Port).
    ```bash
    cp .env.example .env
    ```
4.  Run Database Migrations:
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```
5.  Start the Server:
    ```bash
    npm run dev
    ```

### 3. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Copy `.env.example` to `.env` and set `VITE_API_URL` (e.g., `http://localhost:3000/api`).
    ```bash
    cp .env.example .env
    ```
4.  Start the Development Server:
    ```bash
    npm run dev
    ```

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for CI/CD, defined in `.github/workflows/main.yml`.

### Workflow Stages

1.  **Build**:
    -   Builds Docker images for both Frontend and Backend.
    -   Loads images locally for testing.

2.  **Test**:
    -   Starts the Backend and Database services using Docker Compose.
    -   Performs a health check (`curl http://localhost:3000/api/health`) to ensure the backend is running correctly.

3.  **Push**:
    -   Logs in to the Docker Registry.
    -   Pushes the built images to the registry (e.g., Docker Hub) using tags defined in secrets.

4.  **Deploy**:
    -   Connects to a remote server using a Docker Context (`remote-client`).
    -   Pulls the latest images and restarts the services using `docker compose up -d`.

### Secrets Required

The following GitHub Secrets are required for the pipeline:

-   `DOCKER_USERNAME`, `DOCKER_PASSWORD`: For Docker Registry authentication.
-   `BACKEND_IMAGE_TAG`, `FRONTEND_IMAGE_TAG`: Full image names (e.g., `user/repo:backend-latest`).
-   `PORT`: Backend port.
-   `DATABASE_URL`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: Database connection details.
-   `VITE_API_URL`: Frontend API URL.
