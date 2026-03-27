# Mini Spotify 🎵

A full-featured mini music player built with Vanilla JavaScript, Node.js, and SQLite.

## Features

- ✅ User Authentication (Register/Login)
- ✅ Music Player with Controls (Play, Pause, Next, Previous)
- ✅ Progress Bar with Time Display
- ✅ Volume Control
- ✅ Search Functionality
- ✅ Playlist Management
- ✅ Queue Display
- ✅ Responsive Design

## Project Structure

```
mini-song/
├── frontend/
│   ├── index.html
│   └── assets/
│       ├── css/
│       │   └── style.css
│       ├── js/
│       │   ├── api.js
│       │   ├── auth.js
│       │   ├── player.js
│       │   └── app.js
│       └── music/
│
└── backend/
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── models/
    │   ├── User.js
    │   ├── Playlist.js
    │   └── Song.js
    ├── routes/
    │   ├── auth.js
    │   ├── song.js
    │   └── playlist.js
    ├── controllers/
    └── middleware/
        └── auth.js
```

## Installation

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Install nodemon globally (optional, for development):
```bash
npm install -g nodemon
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Open the frontend folder in your browser or use a local server:
```bash
cd frontend
python -m http.server 8000
# or
npx http-server
```

Open `http://localhost:8000` in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/search?q=query` - Search songs

### Playlists
- `GET /api/playlists` - Get user's playlists
- `POST /api/playlists` - Create new playlist

## Usage

1. **Register** - Create a new account with username, email, and password
2. **Login** - Sign in with your credentials
3. **Browse Songs** - View all available songs in the Now Playing section
4. **Search** - Use the search feature to find specific songs or artists
5. **Play Music** - Click play button or select songs from queue
6. **Create Playlists** - Organize your favorite songs into playlists
7. **Control Playback** - Use prev/next buttons, adjust volume, seek through songs

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT, bcryptjs

## Future Enhancements

- [ ] Actual music file uploads
- [ ] Real streaming functionality
- [ ] User profiles & social features
- [ ] Advanced search filters
- [ ] Shuffle & repeat modes
- [ ] Recently played tracks
- [ ] User recommendations

## License

MIT
