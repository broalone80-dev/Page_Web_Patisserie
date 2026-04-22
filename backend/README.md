# ⚙️ Patisserie API (Backend)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](#)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-black.svg)](#)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-blue.svg)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](#)

This is the central API for the Patisserie E-Commerce platform. It handles authentication, product management, order processing, and payment integrations.

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **PostgreSQL**: 16.x or higher

### 2️⃣ Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Copy the example environment file and fill in your details:
    ```bash
    cp .env.example .env
    ```

3.  **Database Initialisation**:
    ```bash
    npx prisma migrate dev
    npx prisma generate
    ```

4.  **Run in Development**:
    ```bash
    npm run dev
    ```

The API will be available at `http://localhost:4000`.

---

## 📚 Technical Documentation

For detailed guides and architecture diagrams, please refer to the main documentation directory:

-   **[System Architecture](../docs/ARCHITECTURE.md)**
-   **[Database Schema & Prisma Setup](../docs/PRISMA_SETUP.md)**
-   **[Payment Integration Guide](../docs/PAYMENT_INTEGRATION.md)**
-   **[Backend Security Policies](../docs/ARCHITECTURE.md#security)**

---

## 🛠️ Tech Stack

-   **Framework**: Express.js with TypeScript
-   **ORM**: Prisma
-   **Database**: PostgreSQL
-   **Auth**: JWT with Refresh Tokens & HttpOnly Cookies
-   **Validation**: Zod / Express-validator
-   **Monitoring**: Sentry

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User Registration | - |
| `POST` | `/api/auth/login` | User Login | - |
| `GET` | `/api/products` | List Products | - |
| `POST` | `/api/orders` | Create Order | JWT |
| `POST` | `/api/payments/initiate` | Start Payment | JWT |

Full API documentation is available via Swagger at `/api-docs` when running in development mode.

---

## 🐳 Docker Support

To run the backend using Docker:

```bash
docker build -t patisserie-backend .
docker run -p 4000:4000 --env-file .env patisserie-backend
```

---

**Version**: 1.0.0
**Lead**: dev@patisserie.cm
