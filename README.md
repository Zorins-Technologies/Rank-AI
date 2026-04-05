# RANK AI

AI-powered SEO blog generator SaaS platform using Google Gemini, Imagen, Firestore, and Cloud Storage.

Built by [Zorins Technologies](https://github.com/Zorins-Technologies)

## Features

- 🤖 **AI Blog Generation** — Google Gemini creates SEO-optimized, long-form blog posts
- 🎨 **AI Image Generation** — Google Imagen generates matching header images
- 📊 **SEO Scoring** — Automatic SEO analysis with detailed breakdown (0-100 score)
- 🔗 **SEO-Friendly URLs** — Auto-generated slugs for each blog
- ❓ **FAQ Generation** — AI-generated FAQ section with every blog
- ☁️ **Cloud Storage** — Images stored in Google Cloud Storage
- 🔥 **Firestore Database** — Blogs persisted in Cloud Firestore
- 🎯 **Meta Tags** — Title + description generated and stored for each blog

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Google Vertex AI (Gemini 2.0 Flash, Imagen 3.0) |
| Database | Google Cloud Firestore |
| Storage | Google Cloud Storage |
| Auth | Google Application Default Credentials |

## Project Structure

```
rank-ai/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express server entry point
│   │   ├── config/
│   │   │   └── index.js              # Environment config
│   │   ├── middleware/
│   │   │   └── validate.js           # Input validation
│   │   ├── routes/
│   │   │   └── blog.routes.js        # API routes
│   │   ├── services/
│   │   │   ├── gemini.service.js      # Gemini blog generation
│   │   │   ├── imagen.service.js      # Imagen image generation
│   │   │   ├── firestore.service.js   # Firestore CRUD
│   │   │   └── storage.service.js     # Cloud Storage uploads
│   │   └── utils/
│   │       ├── seo.js                 # SEO score calculator
│   │       └── slug.js                # URL slug generator
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js             # Root layout
│   │   │   ├── globals.css            # Global styles
│   │   │   ├── page.js               # Dashboard (home)
│   │   │   ├── generate/page.js      # Blog generator
│   │   │   └── blogs/page.js         # Blog listing + detail
│   │   ├── components/
│   │   │   └── Navbar.js             # Navigation
│   │   └── lib/
│   │       └── api.js                # API client
│   ├── jsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.local
├── .gitignore
└── README.md
```

## Prerequisites

1. **Google Cloud Project** with these APIs enabled:
   - Vertex AI API
   - Cloud Firestore API
   - Cloud Storage API

2. **Google Cloud Authentication:**
   ```bash
   gcloud auth application-default login
   ```

3. **Cloud Storage Bucket:**
   ```bash
   gcloud storage buckets create gs://YOUR_BUCKET_NAME --location=us-central1 --uniform-bucket-level-access
   gcloud storage buckets add-iam-policy-binding gs://YOUR_BUCKET_NAME --member=allUsers --role=roles/storage.objectViewer
   ```

4. **Firestore Database** (Native mode) created in your GCP project.

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your GCP values
npm install
npm run dev
```

Backend runs on http://localhost:8000

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## API Endpoints

| Method | Endpoint           | Description                    |
|--------|--------------------|--------------------------------|
| POST   | /api/generate-blog | Generate blog + image pipeline |
| POST   | /api/generate-image| Generate image only            |
| GET    | /api/blogs         | List all blogs                 |
| GET    | /api/blogs/:id     | Get blog by ID or slug         |
| GET    | /api/health        | Health check                   |

## Environment Variables

### Backend (.env)
```
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
VERTEX_LOCATION=us-central1
PORT=8000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Security Notes

**Development Firestore Rules (open for testing):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Production Firestore Rules (recommended):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /blogs/{blogId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Future Roadmap

- [ ] Content Planner — Generate 30-day blog ideas from a niche
- [ ] Auto Blog Scheduler — Schedule daily/weekly auto-generation
- [ ] Multi-language Support — Generate blogs in 50+ languages
- [ ] Social Media Auto-posting — Share to Twitter/LinkedIn on publish
- [ ] User Authentication — Login/signup with usage quotas
- [ ] Analytics Dashboard — Track blog performance
- [ ] Export — Download blogs as HTML/Markdown/PDF

## License

Proprietary — Zorins Technologies
