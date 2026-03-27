# Mini Spotify - Full Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Python (for running frontend locally)

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create .env file
```bash
copy .env.example .env
# Edit .env with your settings
```

### 3. Start Backend Server
```bash
npm run dev
```

Server will run at: `http://localhost:5000`

## Frontend Setup

### 1. Run Frontend Development Server
```bash
cd frontend
python -m http.server 8000
# or
npx http-server
```

Open in browser: `http://localhost:8000`

## Features

### User Features
- ✅ Register/Login with authentication
- ✅ Upload music files (MP3, WAV, OGG)
- ✅ Play/Pause/Next/Previous controls
- ✅ Search songs
- ✅ Create playlists
- ✅ Volume control
- ✅ Progress bar with time display

### Admin Features (egyrem985@gmail.com)
- ✅ View all users and songs
- ✅ Change user roles
- ✅ Dashboard with statistics
- ✅ Manage all system content

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Songs
- `GET /api/songs` - Get user's songs
- `GET /api/songs/search?q=query` - Search songs
- `POST /api/songs/upload` - Upload new song
- `DELETE /api/songs/:id` - Delete song

### Playlists
- `GET /api/playlists` - Get user's playlists
- `POST /api/playlists` - Create playlist

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Change user role
- `GET /api/admin/songs` - Get all songs

## Troubleshooting

### 401 Unauthorized Error
- Make sure you're logged in first
- Check that the backend server is running on :5000
- Verify token is being sent (check Network tab in DevTools)
- Clear browser localStorage if needed: `localStorage.clear()`
- Try logging out and logging back in

### Upload Not Working
- Check file is audio format (MP3, WAV, OGG)
- Ensure backend is running
- Check file size is reasonable
- Look for any error messages in the Upload Song view

### Database Issues
- Delete `database.db` file and restart server
- Check folder permissions
- Verify `.env` file exists and DATABASE_URL is correct
