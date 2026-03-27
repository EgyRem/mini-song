# 📋 Deployment Checklist

Before deploying to Vercel, make sure to complete all these steps:

## Step 1: Prepare Local Environment ✅

- [ ] Install Node.js 18 or higher
- [ ] Install PostgreSQL client tools (psql) or use web-based Supabase editor
- [ ] Clone or ensure your code is committed to GitHub
- [ ] Run `npm install` in backend folder to install dependencies:
  ```bash
  cd backend
  npm install
  cd ..
  ```

## Step 2: Setup Supabase PostgreSQL Database ✅

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project:
  - Name: `mini-song`
  - Region: Closest to your location
  - Save the database password securely
  
- [ ] Get connection credentials from **Settings → Database**:
  - [ ] Copy the connection string or individual credentials
  - [ ] Save to a temporary safe location
  
- [ ] Run SQL schema to create tables:
  - In Supabase **SQL Editor** tab
  - Create new query
  - Copy-paste entire content of `SCHEMA.sql`
  - Click "Run" button
  - Verify tables appear in **Table Editor**

- [ ] Test connection:
  ```bash
  psql "postgresql://postgres:PASSWORD@HOST:5432/postgres"
  \dt  # List all tables, should show users, songs, playlists, playlist_songs
  \q   # Exit
  ```

## Step 3: Configure Backend for Vercel ✅

- [ ] Created `backend/db-postgres.js` - PostgreSQL connection file
- [ ] Updated `backend/package.json` - Added pg and pg-promise
- [ ] Updated `backend/.env.example` - PostgreSQL connection variables
- [ ] Updated models: `User.js`, `Song.js`, `Playlist.js` - PostgreSQL queries
- [ ] Created `backend/.vercelignore` - Exclude files from Vercel build

## Step 4: Configure Frontend for Production ✅

- [ ] Updated `frontend/assets/js/api.js` - Smart API URL detection
  - Detects local vs production environment
  - Frontend will auto-connect to correct backend
- [ ] Created `frontend/.vercelignore` - Only necessary files

## Step 5: Push to GitHub ✅

- [ ] Ensure `.env` is in `.gitignore` (never commit secrets)
- [ ] Verify `.gitignore` includes:
  ```
  .env
  .env.local
  backend/.env
  node_modules/
  database.db
  ```
- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Prepare for Vercel deployment with PostgreSQL"
  git push origin main
  ```

## Step 6: Deploy Backend to Vercel (First) ✅

- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New" → "Project"
- [ ] Import your GitHub repository
- [ ] Configure as:
  ```
  Project Name: mini-song-api
  Framework: Other (Node.js)
  Root Directory: backend
  Build Command: npm install
  Environment Variables (ADD THESE):
    DATABASE_URL = postgresql://postgres:PASSWORD@HOST:5432/postgres
    JWT_SECRET = (create a long random string, 32+ characters)
    NODE_ENV = production
  ```
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete (~2-3 minutes)
- [ ] Visit the URL to verify: Should show `{"status":"OK"}`
- [ ] Copy the backend URL (e.g., `https://mini-song-api.vercel.app`)

## Step 7: Deploy Frontend to Vercel (Second) ✅

- [ ] In Vercel dashboard, click "Add New" → "Project"
- [ ] Import the **same** GitHub repository again
- [ ] Configure as:
  ```
  Project Name: mini-song
  Framework: Other (Vanilla JavaScript)
  Root Directory: frontend
  Build Command: (leave empty)
  Environment Variables: (none needed)
  ```
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Visit the URL to verify site loads
- [ ] Copy the frontend URL (e.g., `https://mini-song.vercel.app`)

## Step 8: Update Backend CORS (if needed) ✅

- [ ] Edit `backend/server.js` CORS configuration
- [ ] Add your frontend Vercel URL to allowed origins:
  ```javascript
  const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://mini-song.vercel.app',
  ];
  ```
- [ ] Commit and push to GitHub
- [ ] Vercel will auto-redeploy

## Step 9: Test Everything ✅

### Backend Health Check
- [ ] Open in browser:
  ```
  https://mini-song-api.vercel.app/api/health
  ```
  Should return: `{"status":"OK","timestamp":"..."}`

### Frontend + Backend Integration
- [ ] Open frontend: `https://mini-song.vercel.app`
- [ ] Open DevTools (F12) → Network tab
- [ ] Try to **Register** new account
  - Check Network tab: POST to `/api/auth/register` should succeed (200)
  - Should redirect to app
  
- [ ] Try to **Login**
  - Network shows POST to `/api/auth/login` (200)
  - Token stored in localStorage
  
- [ ] **Upload a song**
  - Try uploading an MP3 file
  - Check Database in Supabase → `songs` table
  - New song should appear
  
- [ ] **Search songs**
  - Go to Search tab
  - Search for a song
  - Should find the one you uploaded
  
- [ ] **Check Admin Panel** (if admin user)
  - Click Admin tab
  - Should see stats, users list, songs list

### Database Verification
- [ ] Go to Supabase dashboard
- [ ] Click "Table Editor"
- [ ] Check each table for data:
  - `users` - Should have registration(s)
  - `songs` - Should have uploads
  - `playlists` - If created
  - `playlist_songs` - If songs added to playlist

## Step 10: Configure Custom Domain (Optional) ✅

- [ ] In Vercel project settings → Domains
- [ ] Add your custom domain
- [ ] Update DNS records as shown in Vercel
- [ ] Wait for DNS propagation (can take 24 hours, usually 5-30 min)

## 🚨 Troubleshooting

### Frontend shows blank page
- [ ] Check browser console (F12) for errors
- [ ] Verify `API_BASE` in network requests (should show Vercel URL)
- [ ] Check Vercel logs for frontend project

### Backend returns 500 errors
- [ ] Check Vercel backend logs
- [ ] Verify DATABASE_URL is correct
- [ ] Ensure JWT_SECRET is set
- [ ] Test database connection:
  ```bash
  psql "postgresql://postgres:PASSWORD@HOST:5432/postgres"
  ```

### Frontend can't connect to backend
- [ ] Check browser Network tab (F12)
- [ ] Should see requests to `https://mini-song-api.vercel.app`
- [ ] Check CORS errors in Console
- [ ] Verify backend CORS settings include frontend URL

### Database tables are empty
- [ ] Run Schema SQL again in Supabase SQL Editor
- [ ] Verify tables exist: Go to Supabase → Table Editor
- [ ] Check Vercel backend logs for errors during requests

### File uploads not working
- [ ] Vercel serverless has limitations with file storage
- [ ] Files need to be uploaded to cloud storage (TODO: Setup S3 or Supabase Storage)

## 📊 Production Maintenance

### Regular Backups
- [ ] Enable automatic backups in Supabase:
  - Settings → Backups
  - Enable automated daily backups
  
### Monitor Performance
- [ ] Check Vercel analytics:
  - Frontend project → Analytics tab
  - Backend project → Function Logs
  
### Update Dependencies
- [ ] Periodically run: `npm update` in backend
- [ ] Test locally before deploying

## 🎉 Success!

Your app should now be live at:
- **Frontend:** `https://mini-song.vercel.app`
- **Backend API:** `https://mini-song-api.vercel.app/api`
- **Database:** Supabase PostgreSQL

Any feature changes:
1. Update code locally
2. Commit and push to GitHub
3. Vercel auto-deploys (usually within 1-2 minutes)

Enjoy! 🎵
