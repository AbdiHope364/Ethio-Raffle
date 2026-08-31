# 🚀 LuckyEthio (Idil) Enterprise Production Deployment & Hosting Guide

This guide provides step-by-step instructions for deploying the **LuckyEthio** multi-vendor digital raffle platform and double-entry financial accounting system to production hosting environments.

---

## 📋 Recommended Hosting Architecture Options

| Hosting Platform | Best For | Estimated Setup Time | Database Option |
| :--- | :--- | :--- | :--- |
| **1. Vercel (Recommended for Next.js)** | Serverless Next.js Web + Admin apps | 10 Minutes | Supabase / Neon / AWS RDS (PostgreSQL) |
| **2. Railway / Render** | Containerized 1-click full-stack deployment | 15 Minutes | Built-in Managed PostgreSQL |
| **3. VPS / Cloud Server (Ubuntu + Docker)** | Self-hosted full control (DigitalOcean, AWS EC2, Hetzner) | 20 Minutes | Dockerized PostgreSQL / Managed RDS |

---

## 🛠️ Pre-Deployment: PostgreSQL Database Switch

The platform supports both SQLite (local development) and PostgreSQL (production). Before deploying to a cloud host with PostgreSQL, switch the Prisma datasource:

```bash
# 1. Switch Prisma to PostgreSQL mode:
npm run db:switch:pg

# 2. Push schema to your live PostgreSQL database:
DATABASE_URL="postgresql://user:pass@host:5432/luckyethio_db?sslmode=require" npm run db:push

# 3. Seed initial chart of accounts and roles:
DATABASE_URL="postgresql://user:pass@host:5432/luckyethio_db?sslmode=require" npm run db:seed
```

*(To switch back to local SQLite at any time, run `npm run db:switch:sqlite`)*

---

## 🌐 Option 1: Deploying on Vercel (Recommended)

Because LuckyEthio is a Turborepo monorepo with two Next.js applications (`@raffle/web` and `@raffle/admin`), deploy them as two linked Vercel projects from your GitHub repository:

### Project A: Customer & Agent Web Portal (`@raffle/web`)
1. In Vercel Dashboard, click **Add New...** → **Project** and select your GitHub repository.
2. Under **Root Directory**, click **Edit** and choose: `apps/web`.
3. Set **Framework Preset**: `Next.js`.
4. Set **Build Command**: `cd ../.. && npx turbo run build --filter=@raffle/web` (or leave default Turborepo auto-detection).
5. Add Environment Variables (from `.env.example`):
   * `DATABASE_URL`: Your production PostgreSQL connection string (from Supabase, Neon, or Railway).
   * `JWT_SECRET`: Random 64-char string (`openssl rand -base64 48`).
   * `NEXT_PUBLIC_BASE_URL`: `https://your-raffle-domain.com`
   * `NEXT_PUBLIC_ADMIN_URL`: `https://admin.your-raffle-domain.com`
   * `CHAPA_SECRET_KEY`, `TELEBIRR_APP_KEY`, `CBE_BIRR_API_KEY`, `SANTIMPAY_PRIVATE_KEY`
6. Click **Deploy**.

### Project B: Admin & Financials Console (`@raffle/admin`)
1. Click **Add New...** → **Project** and select the same repository.
2. Under **Root Directory**, choose: `apps/admin`.
3. Set Environment Variables:
   * `DATABASE_URL`: Same PostgreSQL database URL.
   * `JWT_SECRET`: Same JWT secret key.
   * `NEXT_PUBLIC_BASE_URL`: `https://your-raffle-domain.com`
4. Click **Deploy**.

---

## 🚂 Option 2: Deploying on Railway / Render

1. Connect your GitHub repository to Railway or Render.
2. Add a **PostgreSQL Database** service.
3. Deploy the application using the included `Dockerfile` or Nixpacks.
4. Set the environment variables in Railway/Render dashboard.
5. In the build/deploy command, execute:
   ```bash
   npm run db:switch:pg && npm run db:push && npm run db:seed && npm run build
   ```

---

## 🐳 Option 3: Deploying with Docker on a VPS (DigitalOcean / AWS / Hetzner)

1. SSH into your Ubuntu VPS server:
   ```bash
   ssh root@your-server-ip
   ```
2. Install Docker & Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
   ```
3. Clone your repository:
   ```bash
   git clone https://github.com/AbdiHope364/Ethio-Raffle.git
   cd Ethio-Raffle
   ```
4. Configure production `.env`:
   ```bash
   cp .env.example .env
   nano .env
   ```
5. Launch the complete containerized stack (PostgreSQL + Web + Admin):
   ```bash
   docker compose up -d --build
   ```

---

## 🔐 Payment Gateway Webhook URLs for Production

Configure the following webhook endpoints in your payment provider dashboards:

* **Chapa Dashboard (Webhooks)**:  
  `https://your-domain.com/api/payments/webhook?provider=CHAPA`
* **Telebirr Instant Payment Notification (IPN)**:  
  `https://your-domain.com/api/payments/webhook?provider=TELEBIRR`
* **CBE Birr Callback URL**:  
  `https://your-domain.com/api/payments/webhook?provider=CBE_BIRR`
* **SantimPay Notification URL**:  
  `https://your-domain.com/api/payments/webhook?provider=SANTIMPAY`

---

## 🛡️ Production Recommendations & Best Practices

1. **Database SSL & Connection Pooling**:
   Always include `?sslmode=require&pgbouncer=true` when using serverless databases like Supabase or Neon to prevent connection exhaustion.
2. **Secrets Management**:
   Never commit `.env` to Git. Ensure `.gitignore` ignores all local `.env` and `*.db` files.
3. **Automated Backups**:
   Enable daily automated snapshots on your PostgreSQL database (minimum 30-day retention for double-entry financial audit logs).
4. **NLA / Statutory Compliance**:
   Configure statutory 15% VAT withholding and ensure Two-Person Rule consensus is active for all live draw room executions.

