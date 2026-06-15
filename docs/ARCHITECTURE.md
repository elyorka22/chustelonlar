# Chust E'lon — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  Next.js App Router · React 19 · TailwindCSS · Leaflet      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                    Nginx Reverse Proxy                         │
│              SSL (Let's Encrypt) · Rate Limit Headers          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Next.js Application (Docker)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ App Router  │  │ API Routes   │  │ Server Actions      │  │
│  │ (RSC Pages) │  │ /api/*       │  │ (mutations)         │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘  │
│         └────────────────┼─────────────────────┘             │
│                          │                                     │
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │                    Service Layer                        │  │
│  │  ads.ts · auth.ts · image.ts · spaces.ts · redis.ts      │  │
│  └───────────────────────┬────────────────────────────────┘  │
└──────────────────────────┼────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────────────┐
│  PostgreSQL  │  │    Redis     │  │  DigitalOcean Spaces │
│  (Prisma)    │  │  (Cache/RL)  │  │  (CDN Images)        │
└──────────────┘  └──────────────┘  └──────────────────────┘
```

## Data Flow

### Ad Creation Flow
```
User → Create Form → Upload Images → /api/upload
                                        │
                                   Sharp Pipeline
                                   (resize, webp, strip)
                                        │
                                   DO Spaces CDN
                                        │
User → Submit Form → Server Action → Prisma (status: PENDING)
                                        │
                                   Admin Dashboard
                                        │
                              Approve / Reject → APPROVED
```

### Image Pipeline
```
Original (5-20MB JPG/PNG)
    → Validate MIME + magic bytes
    → Strip EXIF metadata
    → Resize (max 1920px width)
    → WebP compress (quality 78)
    → Generate thumbnail (400px)
    → Upload to ads/full/ and ads/thumb/
    → Return CDN URLs
```

### Map Discovery Flow
```
/map page → fetch /api/ads/map → Approved ads with coordinates
    → Leaflet + OSM tiles
    → MarkerClusterGroup
    → Sidebar sync with marker focus
```

## Database Schema

| Model | Purpose |
|-------|---------|
| User | Auth, roles (USER/ADMIN/BANNED) |
| Account/Session | NextAuth OAuth sessions |
| Ad | Classified listings with geo |
| AdImage | Full + thumbnail CDN URLs |
| Favorite | User saved ads |
| Report | Moderation reports |

## Security Layers

1. **Middleware** — Route protection (auth, admin)
2. **Rate Limiting** — Redis-backed per IP/user
3. **Input Sanitization** — DOMPurify + Zod validation
4. **Upload Validation** — Type, size, Sharp content check
5. **RBAC** — Role checks on admin actions
6. **Nginx Headers** — XSS, frame, content-type protection

## Deployment Topology (DigitalOcean)

| Component | Service |
|-----------|---------|
| Compute | Droplet (2GB+ RAM) |
| Database | Managed PostgreSQL or Docker |
| Storage | Spaces + CDN |
| SSL | Let's Encrypt via Certbot |
| Proxy | Nginx container |
| Cache | Redis container |

## Key Design Decisions

- **Server Components** for data-heavy pages (SEO, performance)
- **Client Components** only for interactivity (map, forms, theme)
- **Server Actions** for mutations (simpler than REST for forms)
- **Dynamic rendering** for all DB-backed pages
- **Standalone output** for minimal Docker image size
- **Sharp server-side** to keep client bundle small
