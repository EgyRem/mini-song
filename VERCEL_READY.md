# 🚀 Mini Song - Vercel Deployment Ready!

Your Mini Song application is now configured for production deployment on **Vercel** with **Supabase PostgreSQL** database.

## 📚 Documentation Files

Read these in order:

1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed step-by-step guide
2. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Quick reference checklist
3. **[SCHEMA.sql](./SCHEMA.sql)** - PostgreSQL database schema

## ✨ What Changed

### Backend (`backend/`)
- ✅ Replaced SQLite with PostgreSQL
- ✅ Added `db-postgres.js` - New PostgreSQL connection handler
- ✅ Updated all models to use async/await with `pg-promise`
- ✅ Updated `package.json` - Added `pg` and `pg-promise` dependencies
- ✅ Updated `server.js` - Vercel-compatible export, enhanced CORS
- ✅ Updated `.env.example` - PostgreSQL connection variables

### Frontend (`frontend/`)
- ✅ Smart API URL detection in `api.js`
- ✅ Automatically uses correct backend URL (local vs production)

### Configuration Files
- ✅ `vercel.json` - Routing configuration for Vercel
- ✅ `SCHEMA.sql` - PostgreSQL schema for Supabase
- ✅ `.vercelignore` files - Exclude unnecessary files from builds

## 🎯 Next Steps

### For Local Testing (Optional but Recommended)

1. Install PostgreSQL locally or use Supabase
2. Create `.env` file in `backend/`:
   ```bash
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   DATABASE_URL=postgresql://postgres:password@localhost:5432/mini_song
   ```
3. Run migrations:
   ```bash
   psql -U postgres < SCHEMA.sql
   ```
4. Test locally:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

### For Production Deployment

Follow [DEPLOYMENT.md](./DEPLOYMENT.md) - TL;DR:

1. **Setup Supabase** (5 min)
   - Create account
   - Create project
   - Run SCHEMA.sql

2. **Deploy Backend** (5 min)
   - Connect GitHub to Vercel
   - Create project from `backend/` folder
   - Add environment variables

3. **Deploy Frontend** (5 min)
   - Create second Vercel project from `frontend/` folder
   - No environment variables needed

4. **Test** (2 min)
   - Register new account
   - Upload song
   - Play music
   - Check admin panel

## 🔧 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet User                        │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────────────┐ ┌──▼─────────────────────┐
│  Mini Song Frontend  │ │  Mini Song Backend API │
│  (Vercel Static)     │ │  (Vercel Serverless)   │
│  mini-song.vercel.app│ │  mini-song-api.ver...  │
└───────────────────── ┘ └──┬─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Supabase      │
                    │  PostgreSQL    │
                    │  Database      │
                    └────────────────┘
```

## 🔐 Security Notes

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens with 7-day expiration
- ✅ PostgreSQL with parameterized queries (SQL injection safe)
- ✅ CORS configured to specific origins
- ✅ Environment variables never committed to git
- ⚠️ File uploads: Currently stored in Vercel temp storage - TODO: migrate to S3/Supabase Storage

## 📊 Performance Tips

- Backend uses connection pooling with pg-promise
- Database queries include indexes for speed
- Frontend uses lazy loading and efficient caching
- Vercel auto-scales serverless functions

## 🆘 Support

### Common Issues

**"Cannot find module 'pg-promise'"**
- Run: `cd backend && npm install`

**"Database connection refused"**
- Check DATABASE_URL format
- Verify Supabase connection credentials
- Whitelist your IP if on restrictive network

**"Frontend shows 404 Not Found"**
- Check Vercel build logs
- Ensure `frontend/` folder is deployed (not `backend/`)

**"API requests failing"**
- Check browser Network tab (F12)
- Verify CORS configuration
- Check backend logs in Vercel dashboard

### Useful Commands

```bash
# Test database connection
psql "postgresql://user:pass@host:port/database"

# Install dependencies
cd backend && npm install

# Run backend locally
npm run dev

# Deploy logs
# Visit Vercel dashboard → Project → Deployments → Logs
```

## 📞 Next Steps

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) carefully
2. Set up Supabase account and project
3. Follow the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. Deploy to Vercel!

---

**Ready to go live?** 🎵 Start with [DEPLOYMENT.md](./DEPLOYMENT.md)!
