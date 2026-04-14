# Rank AI – Full-Stack AEO & SEO Platform

Rank AI is a premium SaaS platform designed for Answer Engine Optimization (AEO) and traditional SEO. It offers high-conversion landing pages, AI-powered keyword research, growth plan generation, and fully automated blog publishing to CMS platforms like WordPress and Webflow.

## 🚀 Architecture overview

This project operates as a monorepo containing a modern stack tailored for performance and scale.

*   **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
*   **Backend**: Node.js, Express, PostgreSQL
*   **Database**: Google Cloud SQL (PostgreSQL), `pg`
*   **Auth**: Firebase Client SDK & Firebase Admin
*   **AI Engine**: Google Vertex AI (Gemini 2.0 Flash, Imagen)
*   **Infrastructure target**: Google Cloud Run & Cloud Storage

## 📋 Prerequisites
1.  Node.js v18+
2.  PostgreSQL Database (Local or Cloud SQL)
3.  Google Cloud Service Account (with permissions for Vertex AI, Cloud Storage, and Cloud SQL)
4.  Firebase Project Setup
5.  Stripe Account (for billing)

## 🛠️ Local Development Setup

### 1. Environment Variables Configuration
To run the apps, you need configuration files.
*   **Backend**: Navigate to `/backend`. Copy `.env.example` to `.env` and fill out your local Postgres connection credentials, GCP keys, Stripe keys, etc.
*   **Frontend**: Navigate to `/frontend`. Copy `.env.example` to `.env.local` and add your Firebase configuration. *Note: `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8080/api` locally.*

### 2. Dependency Installation
Run the root script to gracefully install dependencies for the root, frontend, and backend packages:
```bash
npm run install-all
```

### 3. Server Initialization & Running Locally
Start both the backend and frontend simultaneously from the root directory:
```bash
npm run dev
```

*   **Frontend**: `http://localhost:3000`
*   **Backend**: `http://localhost:8080` (Database tables will auto-migrate on first boot)

---

## 🚢 Production Deployment (Google Cloud Run)

### Backend Deployment
The backend uses a standard `Dockerfile` configured to compile the source code and expose port `8080`.
Ensure that the Cloud Run service is linked to Cloud SQL via a unix-socket. 
Key Environment Variable to set in GCP: 
*   `INSTANCE_CONNECTION_NAME`: The string identifier for your Cloud SQL instance.
*   `NODE_ENV=production`

### Frontend Deployment
The Next.js frontend `.next` standalone build runs efficiently on Cloud Run.
Make sure to provide `NEXT_PUBLIC_API_URL` pointing safely to the backend Cloud Run service *before* compilation.

## 🛡️ Security Notes
*   Service Account keys and cryptographic keys `.pem` are strictly blocked via `.gitignore`.
*   Ensure that any generated output defaults (mock data logic on AI failure) matches the strict guidelines of your business rules.
