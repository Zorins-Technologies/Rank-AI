# Rank AI 🚀

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Google Vertex AI](https://img.shields.io/badge/Vertex%20AI-Gemini%202.0-blue)](https://cloud.google.com/vertex-ai)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Cloud%20SQL-blue)](https://cloud.google.com/sql/docs/postgres)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

An enterprise-grade AI SaaS platform for generating SEO-optimized blog content using **Google Vertex AI** (Gemini 2.0 Flash) and **PostgreSQL**. Create high-quality, long-form blog posts with matching images, automatic SEO scoring, and secure cloud persistence.

Built by [Zorins Technologies](https://github.com/Zorins-Technologies)

---

## ✨ Features

- 🤖 **Enterprise AI Generation**: Uses Google Vertex AI (Gemini 2.0 Flash) with automatic fallback systems for 100% uptime.
- 🎨 **AI Image Generation**: Automatically generate relevant header images using Google Imagen.
- 📊 **SEO Analysis**: Built-in scoring system providing detailed metrics (Title, Meta, Content, Keyword density).
- 🔗 **Smart Slugs**: Auto-generated, unique, and SEO-friendly URLs.
- ❓ **FAQ Generation**: Automatically includes FAQ sections to boost search engine visibility.
- ☁️ **Cloud Storage**: Secure image storage and delivery via Google Cloud Storage.
- 🐘 **PostgreSQL Power**: Robust data persistence with Cloud SQL (JSONB support for AI analysis).
- 🎯 **Production Ready**: Configured for Cloud Run (Backend) and Firebase App Hosting (Frontend).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Deployment**: Firebase App Hosting
- **Styling**: Tailwind CSS + Framer Motion
- **Auth**: Firebase Auth (ID Token Verification)

### Backend
- **Runtime**: Node.js (Express.js)
- **Deployment**: Google Cloud Run
- **AI Ecosystem**: Google Vertex AI (Gemini 2.0/1.5 Flash, Imagen)
- **Database**: PostgreSQL (Cloud SQL)
- **Security**: Google Application Default Credentials (ADC), Rate Limiting, CORS.

---

## 🚀 Prerequisites

1. **Google Cloud Project** with billing enabled.
2. **Google Cloud CLI** installed:
   ```bash
   gcloud auth application-default login
   ```
3. **Enabled APIs**:
   - Vertex AI API
   - Cloud SQL Admin API
   - Cloud Storage API

---

## 📦 Installation & Setup

### 1. Clone & Install
```bash
git clone https://github.com/Zorins-Technologies/Rank-AI.git
cd Rank-AI
# Install backend deps
cd backend && npm install
# Install frontend deps
cd ../frontend && npm install
```

### 2. Database Setup (Cloud SQL)
1. Create a PostgreSQL instance in Google Cloud SQL.
2. Create a database named `rank_ai`.
3. Create the `blogs` table:
   ```sql
   CREATE TABLE blogs (
     id SERIAL PRIMARY KEY,
     user_id VARCHAR(255) NOT NULL,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     meta_description TEXT,
     keyword VARCHAR(255),
     image_url TEXT,
     slug VARCHAR(255) UNIQUE,
     analysis JSONB DEFAULT '{}',
     faq JSONB DEFAULT '[]',
     status VARCHAR(50) DEFAULT 'published',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 3. Environment Configuration

**Backend (`backend/.env`):**
```env
GCP_PROJECT_ID=hale-life-368716
GCS_BUCKET_NAME=your-bucket-name
VERTEX_LOCATION=us-central1
DB_HOST=your-cloud-sql-public-ip
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=rank_ai
```

**Frontend (`frontend/apphosting.yaml`):**
```yaml
env:
  - variable: NEXT_PUBLIC_API_URL
    value: "https://your-backend-url.a.run.app"
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: "..."
```

---

## 🏗️ Project Structure

```
rank-ai/
├── backend/
│   ├── src/
│   │   ├── config/           # Env & GCP Config
│   │   ├── middleware/       # Auth & Validation
│   │   ├── routes/           # API Endpoints
│   │   ├── services/
│   │   │   ├── gemini.service.js  # Vertex AI Blog Logic
│   │   │   ├── sql.service.js     # PostgreSQL (pg) Client
│   │   │   └── storage.service.js # Cloud Storage
├── frontend/
│   ├── src/                  # Next.js App Router
│   ├── apphosting.yaml       # Firebase Deployment Config
│   └── next.config.js        # Optimized standalone build
└── README.md
```

### 📡 API Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate-blog` | Generate complete blog with content and image |
| `POST` | `/api/generate-image` | Generate image only |
| `GET` | `/api/blogs` | Retrieve all blogs |
| `GET` | `/api/blogs/:id` | Get specific blog by ID or slug |
| `GET` | `/api/health` | Health check endpoint |

---

## 🤝 Contributing

We welcome contributions! Please fork the repository and open a Pull Request.

## 📄 License

Proprietary — Zorins Technologies (C) 2026
