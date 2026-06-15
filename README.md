# Chust E'lon

Modern classified ads platform for Chust city, Uzbekistan.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, TailwindCSS, Shadcn UI
- **Backend:** Next.js API Routes & Server Actions
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth v5 (Google OAuth + Email/Password)
- **Maps:** Leaflet + OpenStreetMap + Marker Clustering
- **Images:** Sharp optimization → DigitalOcean Spaces CDN
- **Cache:** Redis (optional)
- **Deploy:** Docker + Nginx + Let's Encrypt on DigitalOcean

## Features

- Public ads browsing with search & filters
- Interactive map with marker clustering
- User authentication (Google OAuth + credentials)
- Ad creation with image upload pipeline
- Admin moderation dashboard
- Favorites, reports, share
- Dark mode, skeleton loaders, toast notifications
- Mobile-first responsive design

## Quick Start (Development)

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis (optional)

### Setup

```bash
# Clone and install
git clone <repo-url> chustelonlar
cd chustelonlar
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Database setup
npx prisma migrate dev
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test Accounts (after seed)

| Role  | Email               | Password     |
|-------|---------------------|--------------|
| Admin | admin@chustelon.uz  | admin123456  |
| User  | user@chustelon.uz   | user123456   |

## Project Structure

```
chustelonlar/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Test data
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── page.tsx       # Homepage
│   │   ├── ads/           # Ads listing & detail
│   │   ├── map/           # Map view
│   │   ├── create/        # Create ad
│   │   ├── dashboard/     # User dashboard
│   │   ├── admin/         # Admin panel
│   │   ├── login/         # Authentication
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ui/            # Shadcn UI components
│   │   ├── ads/           # Ad-related components
│   │   ├── map/           # Leaflet map components
│   │   ├── layout/        # Header, footer
│   │   ├── admin/         # Admin components
│   │   └── dashboard/     # Dashboard components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── db.ts          # Prisma client
│   │   ├── spaces.ts      # DigitalOcean Spaces
│   │   ├── image.ts       # Sharp image pipeline
│   │   ├── redis.ts       # Redis cache & rate limiting
│   │   ├── sanitize.ts    # XSS protection
│   │   ├── validations.ts # Zod schemas
│   │   ├── services/      # Business logic
│   │   └── actions.ts     # Server actions
│   ├── stores/            # Zustand stores
│   └── types/             # TypeScript types
├── nginx/                 # Nginx config
├── scripts/               # Deployment scripts
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Image Upload Pipeline

1. User uploads image (max 20MB, JPG/PNG/WEBP)
2. Server validates file type
3. Sharp strips EXIF metadata
4. Resizes if width > 1920px
5. Compresses to WebP (quality 75-82)
6. Generates thumbnail (400px width)
7. Uploads both to DigitalOcean Spaces
8. Returns CDN URLs

**Folder structure in Spaces:**
```
ads/full/timestamp-hash.webp
ads/thumb/timestamp-hash.webp
```

## Production Deployment (DigitalOcean)

### Quick checklist

1. **Droplet** — Ubuntu 22.04, 2GB+ RAM
2. **Spaces bucket** — CDN enabled (for images)
3. **Domain** — DNS A-record → Droplet IP
4. **`.env`** — copy from `.env.example`, fill all values

### 1. Server setup

```bash
ssh root@your-droplet-ip
curl -fsSL <repo>/scripts/setup-server.sh | bash
cd /opt/chustelon && git clone <repo-url> .
cp .env.example .env && nano .env
./scripts/check-env.sh
```

Generate secrets:
```bash
openssl rand -base64 32   # AUTH_SECRET
```

### 2. First deploy

```bash
chmod +x scripts/*.sh
./scripts/first-deploy.sh
./scripts/setup-ssl.sh chustelon.uz admin@chustelon.uz
```

### 3. Updates

```bash
./scripts/deploy.sh
```

### Managed PostgreSQL (optional)

If using DigitalOcean Managed DB instead of Docker Postgres:

```bash
# Set DATABASE_URL in .env to managed connection string
docker compose -f docker-compose.yml -f docker-compose.managed-db.yml up -d
```

### Required `.env` variables

| Variable | Required |
|----------|----------|
| `AUTH_SECRET` | Yes |
| `POSTGRES_PASSWORD` | Yes (docker postgres) |
| `DATABASE_URL` | Yes (managed DB) |
| `DO_SPACES_*` | Yes (image uploads) |
| `NEXTAUTH_URL` | Yes |
| `NEXT_PUBLIC_APP_URL` | Yes |
| `AUTH_GOOGLE_*` | Optional |
| `SEED_DB` | `true` only for staging/demo |

### Docker services

| Service | Role |
|---------|------|
| `app` | Next.js application |
| `postgres` | PostgreSQL 16 |
| `redis` | Cache & rate limiting |
| `nginx` | Reverse proxy + SSL |
| `migrate` | One-shot DB migrations |
| `seed` | Optional demo data (`--profile seed`) |

## API Endpoints

| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | /api/ads           | List ads (filtered)  |
| GET    | /api/ads/map       | Map marker data      |
| POST   | /api/upload        | Image upload         |
| GET    | /api/analytics     | Admin analytics      |
| GET/POST | /api/auth/*      | NextAuth handlers    |

## Security

- Rate limiting (Redis-backed)
- Role-based access control (USER, ADMIN, BANNED)
- Input sanitization (DOMPurify)
- Upload validation (type, size, content)
- XSS protection headers (Nginx)
- JWT sessions with NextAuth

## License

Private — Chust E'lon Platform
