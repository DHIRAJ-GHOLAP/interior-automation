# 🏢 InteriorFlow SaaS — Enterprise Interior Automation Platform (v2.0.0)

A production-ready, multi-tenant SaaS platform built for interior designers, architecture firms, and turnkey contractors.

---

## 🌟 Philosophy

> **"Enter natural room measurements and select materials. The platform does the mathematics, computes BOQs with wastage %, generates branded client quotations, dispatches via WhatsApp, and schedules intelligent follow-ups automatically."**

---

## 🚀 Key SaaS Features

### 1. 🏢 Multi-Tenancy & Studio Workspaces
- **Studio Isolation**: Each interior firm/tenant has isolated clients, projects, custom material rates, quotations, and team users.
- **Dynamic Studio Branding**: Configure Studio Name, Phone, Email, GSTIN, and Bank / UPI details.
- **Dynamic PDF Letterhead**: Generated PDF quotations automatically reflect the studio's branding and payment instructions.

### 2. 🔐 Security, JWT Auth & RBAC
- **Cryptographic JWT Tokens**: Signed with HS256 algorithm and configurable expiry.
- **Native Bcrypt Hashing**: Hardened password storage with automatic salting.
- **Role-Based Access Control**:
  - `ADMIN`: Full studio ownership, financials, and team management.
  - `DESIGNER`: Manage projects, rooms, and measurements.
  - `VIEWER`: Read-only access to proposals.
- **Client Transparency Shield**: Public client tokens (`/quote/:token`) expose only transparent client-facing rates, strictly shielding internal purchase costs, wholesale vendors, and gross profit margins.

### 3. 📐 Natural Measurement, Civil & BOQ Engine
- **Room-by-Room & Phase Breakdown**: Enter measurements directly (Height × Width = Sq.Ft, or 3D Volume = CFT).
- **Multi-Dimensional Construction & Interior Units**:
  - `SQFT`: Plywood, laminate, acrylic, gypsum plaster, paint, tile masonry, waterproofing.
  - `CFT` / `VOLUME`: Structural concrete (RCC M25), soil excavation, foundation footings, timber.
  - `BRASS`: Standard Indian civil measure ($1 \text{ Brass} = 100 \text{ Cu.Ft}$) for sand, aggregate metal, and rubble.
  - `RUNNING_FT`: CPVC plumbing supply lines, SWR drainage, electrical conduit, edge banding, cove LED profiles.
  - `PIECE` / `SET` / `BAG` / `KG`: TMT rebar steel, cement bags, AAC blocks, sanitaryware diverters, soft-close hardware.
- **Automated Wastage %**: Configurable per material (e.g. 10% on plywood, 3% on concrete, 4% on steel rebar).
- **Private Margin Tracking**: Real-time gross margin and profitability calculation with internal cost protection.

### 4. 🏗️ Turnkey Project & BOQ Templates
- **Turnkey G+1 Luxury Villa Construction & Interior** (Substructure RCC, AAC masonry, MEP, Italian marble, modular kitchen).
- **Turnkey 3BHK Full Civil Renovation & Luxury Interior** (Demolition, civil alterations, bathroom plumbing, vitrified flooring, false ceiling, carpentry).
- **Commercial Office Fitout** (Acoustic ceilings, glass partitions, modular workstations, network DB).

### 5. 🧾 Luxury Quotations, Revisions & PDF Generator
- **ReportLab PDF Engine**: Instant downloadable multi-page PDF proposal with clean letterhead, milestones, and bank details.
- **Unicode Indian Currency Support**: High-fidelity `₹` rendering with DejaVuSans TrueType fonts, Indian numbering (Lakhs/Crores), and formal amount in words.
- **Revision Engine**: Clone any proposal into revision branches (`INT-2026-0049` ➔ `INT-2026-0049-R1`).
- **Direct WhatsApp Dispatch**: 1-click pre-filled message with dynamic client portal link.

### 5. 🤖 Automated Follow-Up Cadence & AI Sentiment Engine
- **Automated Schedule**: Day 2 (+2d), Day 5 (+5d), Day 10 (+10d) reminders.
- **Anti-Spam Auto-Cancellation**: Instantly cancels pending automated follow-ups as soon as the client responds.
- **AI Classification**: Real-time intent detection (Scope Revision, Price Negotiation, Meeting Request).

---

## 🛠️ Production Deployment

### Option A: Docker Compose (Recommended for Production)

Run the full stack with PostgreSQL 16, Redis, and Gunicorn workers:

```bash
# 1. Copy production environment file
cp .env.example .env

# 2. Start all services
docker compose up -d --build

# 3. Verify health
curl -f http://localhost:8000/api/health
```

### Option B: Local / Bare-Metal Production

```bash
# 1. Start application
./run.sh

# 2. Access dashboard
# Open http://localhost:8000
```

---

## 📊 Observability & System Health

- **Healthcheck Probe**: `GET /api/health`
  - Returns service status, PostgreSQL / SQLite connectivity, latency (ms), version, and uptime.
- **Request Tracing**: Every HTTP response includes `X-Request-ID` and `X-Response-Time`.
- **Security Headers**: Automatic `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `X-XSS-Protection`.

---

## 🔑 Default Credentials (Development Mode)

- **Studio Name**: ABC Interiors (Apex Luxury Interiors)
- **Admin Email**: `admin@abcinteriors.com`
- **Admin Password**: `admin123`
- **API Swagger Docs**: `http://localhost:8000/docs`
