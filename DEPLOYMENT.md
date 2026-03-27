# 🚀 Deployment Guide: Mini Song to Vercel + Supabase

## Prerequisites
- Vercel account (vercel.com)
- Supabase account (supabase.com)
- GitHub repository (recommended for easy deployments)
- Node.js 18+ installed locally

---

## Step 1: Setup Supabase PostgreSQL Database

### 1.1 Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - Name: `mini-song`
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to your users
4. Wait for project to be created (~1-2 minutes)

### 1.2 Get Database Connection Details
1. In Supabase dashboard, go to **Settings → Database**
2. Copy these credentials:
   - **Host:** `[project-ref].supabase.co`
   - **Port:** `5432`
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** The one you created
   - **Full Connection String:** Found in "Connection pooling" section

Save these! You'll need them for environment variables.

### 1.3 Run Migrations
1. In Supabase **SQL Editor**, create a new query
2. Copy-paste the SQL schema from [SCHEMA.sql](./SCHEMA.sql)
3. Run the query
4. Verify tables are created: Check **Table Editor** tab

---

## Step 2: Update Local Environment

### 2.1 Create `.env` file in backend/
```bash
cp backend/.env.example backend/.env
```

### 2.2 Update `.env` with Supabase credentials
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here_make_it_long_random

# PostgreSQL / Supabase
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 2.3 Test database connection locally
```bash
cd backend
npm install
npm run dev
```

Check console for: `✅ Database connected`

---

## Step 3: Upload to GitHub

### 3.1 Initialize Git (if not already)
```bash
git init
git add .
git commit -m "Initial commit: Prepare for Vercel deployment"
```

### 3.2 Push to GitHub
1. Create new repository on GitHub
2. Follow GitHub's instructions to push your code
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mini-song.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Deploy Frontend
1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Other (for vanilla JS)
   - **Root Directory:** `frontend`
   - **Build Command:** Leave blank
   - **Environment Variables:** None needed for frontend

5. Click "Deploy"
6. Your frontend will be live in ~1-2 minutes
7. Vercel will give you a URL like: `https://mini-song.vercel.app`

### 4.2 Update Frontend API URL
1. Edit [frontend/assets/js/api.js](frontend/assets/js/api.js)
2. Change `API_BASE` to your Vercel backend URL (step 4.5)

---

## Step 5: Deploy Backend to Vercel

### 5.1 Create `vercel.json` in root
Already provided - check if exists

### 5.2 Deploy Backend
1. In Vercel dashboard, click "Add New Project" again
2. Import the **same GitHub repository**
3. Configure project:
   - **Name:** `mini-song-api` (different from frontend)
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Output Directory:** (leave blank)
   - **Environment Variables:** Add all from `.env`:
     ```
     NAME: DATABASE_URL
     VALUE: postgresql://postgres:PASSWORD@HOST:5432/postgres
     
     NAME: JWT_SECRET
     VALUE: your_secret_key
     
     NAME: NODE_ENV
     VALUE: production
     ```

4. Click "Deploy"
5. Vercel will give you a URL like: `https://mini-song-api.vercel.app`

### 5.3 Connect Domains (Optional)
- Add custom domain in Vercel project settings

---

## Step 6: Configure CORS on Backend

### 6.1 Update server.js CORS settings
The backend CORS is already configured to accept frontend URL. When deployed:
1. Update [backend/server.js](backend/server.js)
2. Change `ALLOWED_ORIGINS` to include your Vercel frontend URL

```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8000',
  'https://mini-song.vercel.app', // Your frontend URL
];
```

---

## Step 7: Update Frontend API Endpoint

### 7.1 Update frontend API configuration
Edit [frontend/assets/js/api.js](frontend/assets/js/api.js):

```javascript
// Change from:
const API_BASE = 'http://localhost:5000/api';

// To:
const API_BASE = 'https://mini-song-api.vercel.app/api';
```

### 7.2 Redeploy Frontend
1. Commit and push changes
2. Vercel will auto-redeploy (or redeploy manually in dashboard)

---

## Step 8: Test Everything

### 8.1 Test Frontend
1. Open `https://mini-song.vercel.app`
2. Try to register a new account
3. Upload a song
4. Play music
5. Check admin panel (if admin)

### 8.2 Test Backend Logs
1. In Vercel dashboard
2. Go to your backend project
3. Click "Logs" tab
4. Should see API requests coming from frontend

### 8.3 Check Supabase Database
1. In Supabase **Table Editor**
2. Verify data is being saved:
   - New users in `users` table
   - Uploaded songs in `songs` table

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore` (NEVER commit secrets)
- [ ] Database password is strong (20+ chars, mixed case, numbers, symbols)
- [ ] JWT_SECRET is long and random (at least 32 characters)
- [ ] CORS is restricted to only your frontend domain
- [ ] Vercel environment variables are set (never hardcoded in code)
- [ ] Database is set to private (Supabase default)

---

## 🚨 Troubleshooting

### Database Connection Failed
- Check DATABASE_URL format is exactly: `postgresql://user:password@host:port/database`
- Verify password doesn't contain special characters (or URL-encode them)
- Check Supabase firewall allows your IP

### Frontend can't reach backend
- Check API_BASE URL in frontend
- Check CORS is configured for your domain
- Open browser DevTools → Network → See actual error

### 404 Not Found on API routes
- Check vercel.json is properly configured
- Backend routes should be at `/api/auth`, `/api/songs`, etc.

### Files can't upload
- Supabase doesn't support file uploads like Vercel wouldn't
- **Solution:** Use Supabase Storage or AWS S3 for file storage
- Or keep files locally temporarily and move uploads to cloud storage

---

## 📊 Production Database Backup

### Regular Backups (Supabase)
1. Go to Supabase **Settings → Backups**
2. Enable automated daily backups
3. Download backup whenever needed

### Manual Backup
```bash
# Backup database
pg_dump postgresql://postgres:PASSWORD@HOST:5432/postgres > backup.sql

# Restore database
psql postgresql://postgres:PASSWORD@HOST:5432/postgres < backup.sql
```

---

## 🎉 You're Deployed!

Your app is now live at:
- **Frontend:** https://mini-song.vercel.app
- **Backend API:** https://mini-song-api.vercel.app/api
- **Database:** Hosted on Supabase PostgreSQL

Any future code changes:
1. Commit and push to GitHub
2. Vercel auto-deploys (can be toggled off if needed)
3. Changes live in ~1-2 minutes

Happy streaming! 🎵
