# TaskFlow AI Backend

This is the backend for the TaskFlow AI application, built with **Node.js**, **Express**, and **TypeScript**.

## Prerequisites

- Node.js installed
- `npm` or `yarn`

## Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Running the Server

- **Development Mode** (with hot-reload):
    ```bash
    npm run dev
    ```
- **Build and Start**:
    ```bash
    npm run build
    npm start
    ```

The server will start at `http://localhost:3000`.

## API Endpoints

### Auth
- **POST** `/api/auth/login`
    - Body: `{ email, password }`
    - Returns: Mock `User` object
    - Note: Password must be at least 6 characters.

### Tasks
- **GET** `/api/tasks`
    - Returns: Array of `Task` objects.
- **POST** `/api/tasks`
    - Body: `Task` object
    - Creates a new task.
- **PUT** `/api/tasks/:id`
    - Body: `Task` object
    - Updates the task with the given ID.
- **DELETE** `/api/tasks/:id`
    - Deletes the task.

## Implementation Details
- **Data Storage**: In-memory array (`tasks`). Data **will be lost** when the server restarts.
- **Delays**: Artificial delays (300-800ms) are added to simulate real network latency.
