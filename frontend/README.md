# 🎨 Patisserie Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](#)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-3.x-blueviolet.svg)](#)
[![Zustand](https://img.shields.io/badge/Zustand-4.x-orange.svg)](#)

A modern, responsive, and high-performance web interface for the Patisserie E-Commerce platform. Built with Next.js 14 and optimized for the Cameroonian market.

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- **Node.js**: 20.x or higher
- **npm**: 10.x or higher

### 2️⃣ Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    ```bash
    cp .env.example .env.local
    ```
    Set `NEXT_PUBLIC_API_URL` to point to your backend (default is `http://localhost:4000/api`).

3.  **Run in Development**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

---

## 📚 Features

-   **Next.js 14 App Router**: Utilizing the latest features for better performance and routing.
-   **Zustand State Management**: Lightweight and fast state handling for Cart and Auth.
-   **Tailwind CSS**: Utility-first styling for a completely custom and responsive design.
-   **Network Resilience**: Custom hooks to handle slow or dropped internet connections gracefully.
-   **SEO Optimized**: Dynamic metadata and structured data for better search engine ranking.

---

## 📁 Source Code Structure

-   `src/components`: Reusable UI components (Product Cards, Layouts, etc.)
-   `src/pages`: Next.js pages and API routes.
-   `src/lib`: Zustand stores and utility functions.
-   `src/hooks`: Custom React hooks (e.g., `useAuth`, `useNetworkRetry`).
-   `src/services`: API client definitions using Axios.

---

## 🐳 Deployment

The frontend is ready to be deployed to **Vercel** or any VPS using Docker.

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

**Version**: 1.0.0
**Lead**: dev@patisserie.cm
