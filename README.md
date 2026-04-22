# 🎂 Patisserie E-Commerce Platform

[![Status](https://img.shields.io/badge/Status-Production--Ready-success.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](#)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](#)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-blue.svg)](#)

A complete, production-ready e-commerce platform tailored for the pastry business in Cameroon. Features integrated payments (Flutterwave, CinetPay), automated backups, and a robust CI/CD pipeline.

---

## 📖 Table of Contents
- [Documentation](#-documentation)
- [Quick Start](#-quick-start)
- [Project Features](#-project-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [API Endpoints](#-api-endpoints)
- [Payment Integration](#-payment-integration)
- [Deployment](#-deployment)
- [Support](#-support)

---

## 📄 Documentation

All detailed technical documentation has been organized into the [docs/](./docs) directory for easy access.

- **[System Architecture](./docs/ARCHITECTURE.md)**: High-level design and component interaction.
- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Detailed VPS, DB, and SSL setup instructions.
- **[CI/CD & Monitoring](./docs/CI_CD_AND_MONITORING.md)**: GitHub Actions, Sentry, and logging.
- **[Payment Integration](./docs/PAYMENT_INTEGRATION.md)**: Flutterwave and CinetPay configuration.
- **[Scaling Guide](./docs/SCALING_GUIDE.md)**: Strategy for growing from 500 to 10k+ users.
- **[Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)**: Final verification steps before launch.
- **[Business Analysis](./docs/BUSINESS_ANALYSIS.md)**: Market research and project goals.

---

## 🚀 Quick Start

### 🛠️ Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/broalone80-dev/Page_Web_Patisserie.git
    cd Page_Web_Patisserie
    ```

2.  **Start the Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```

3.  **Start the Frontend**:
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

4.  **Access the applications**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **API Docs**: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

### 🐳 Docker Deployment

```bash
docker-compose up -d
```

---

## ✨ Project Features

### ✅ Completed
- **E-Commerce Essentials**: Product catalog, shopping cart, and order tracking.
- **Payments**: Multi-provider support (Flutterwave & CinetPay) with webhook handling.
- **Admin Dashboard**: Real-time sales statistics, product management, and order fulfillment.
- **Network Resilience**: Automatic retry logic for unstable mobile data connections.
- **Responsive Design**: Mobile-first UI optimized for high engagement on all devices.
- **DevOps**: Automated daily backups to S3, Sentry error tracking, and GitHub Actions.

### ⏳ In Progress
- UI refinements based on final Figma mockups.
- Advanced animation effects for premium feel.

---

## 🛠️ Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Zustand |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Auth** | JWT (Stateless), HttpOnly Cookies, Bcrypt |
| **Infrastructure** | Docker, Nginx, GitHub Actions |
| **Monitoring** | Sentry, UptimeRobot |

---

## 📁 Project Structure

```text
patisserie/
├── docs/                     # 📄 Project documentation
├── backend/                  # ⚙️ Express.js API
│   ├── prisma/               # Database schema & migrations
│   └── src/                  # Application source code
├── frontend/                 # 🎨 Next.js application
│   └── src/                  # React components & pages
├── catalog/                  # 📦 Product data & assets
├── .github/                  # 🤖 GitHub Actions workflows
├── nginx.conf                # 🔒 Reverse proxy configuration
├── docker-compose.yml        # 🐳 Container orchestration
└── README.md                 # 🏠 You are here
```

---

## 🔐 Security

- **JWT Authentication**: Secure tokens with rotation and HttpOnly storage.
- **Data Protection**: Full protection against SQL Injection via Prisma.
- **Network Security**: HTTPS/SSL enforcement and security headers (Helmet).
- **Payment Security**: Webhook signature verification and transaction logging.

---

## 📦 Deployment Strategies

Detailed guides for various hosting providers are available in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

- **Recommended**: Docker on a VPS (DigitalOcean/Linode) + AWS RDS.
- **Quick Launch**: Heroku, Railway, or Render.
- **Enterprise**: AWS/GCP with Kubernetes.

---

## 📞 Support & Community

- **Bugs & Features**: Please open a [GitHub Issue](https://github.com/broalone80-dev/Page_Web_Patisserie/issues).
- **Inquiries**: [dev@patisserie.cm](mailto:dev@patisserie.cm)
- **Status Page**: [https://status.patisserie.cm](https://status.patisserie.cm)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Last Updated**: April 2024
**Version**: 1.1.0
**Status**: Production Ready ✅
