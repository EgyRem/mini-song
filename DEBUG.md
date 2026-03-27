# Debug Guide - Mini Spotify

## Error Messages & Solutions

### 1. 🔴 POST /api/auth/register 400 (Bad Request)

**Cause:** Request body validation failed

**Solutions:**
- Check that you're sending: `username`, `email`, `password` in JSON
- Username must be **3+ characters**
- Password must be **6+ characters**
- Email must be valid format
- Check Network tab in DevTools → Request body should be valid JSON

**How to Debug:**
1. Open DevTools (F12)
2. Go to Network tab
3. Try to register
4. Click on the POST request to `/api/auth/register`
5. Look at "Request" tab → Payload
6. Should see: `{"username":"..","email":"...","password":"..."}`
7. Check console (server terminal) for error message

---

### 2. 🔴 GET /api/songs 401 (Unauthorized)

**Cause:** Token not being sent with request OR token is invalid/expired

**Solutions:**

**Check if token is saved:**
```javascript
// In DevTools console, run:
localStorage.getItem('authToken')
// Should show a long string, not "null"
```

**Check if token is being sent:**
1. Open DevTools → Network tab
2. Refresh page and login again
3. Look at any API request (like GET /api/songs)
4. Click on request → "Headers" tab
5. Scroll down to "Authorization"
6. Should show: `Bearer <token>`
7. If showing "Authorization: Bearer undefined" → Token not saved properly

**Reset and try again:**
```javascript
// In DevTools console:
localStorage.clear()
```
Then reload page and register/login again

---

### 3. 🔴 POST /api/songs/upload 401 (Unauthorized)

**Same as #2 above** - Token issue

**Additional checks:**
- Make sure you're logged in before uploading
- Check you're not trying to upload without a token
- Verify token is still valid (check localStorage)

---

### 4. 🔴 AbortError: play() request interrupted

**Cause:** Browser security - play() promise not handled properly

**Status:** ✅ FIXED in latest version

**If still occurring:**
- Update browser (latest Chrome/Firefox)
- Click play button once and wait for audio to start
- Don't rapidly click play/pause

---

## Server Debugging

### Check if backend is running:
```bash
# Test in browser console:
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should return: `{status: "OK", timestamp: "..."}`

### Check server logs:
When you run `npm run dev`, you should see:
```
============================================================
🎵 Mini Spotify Server Started
============================================================
✅ Server running on port: 5000
✅ Environment: development
✅ JWT Secret configured: true
✅ Database: ./database.db
============================================================
```

If JWT Secret shows `false` → ❌ .env file not loaded

### Check database:
```bash
# In terminal, check if database exists:
ls database.db
# If file doesn't exist, server will create it and log:
# "Database tables initialized"
```

---

## Frontend Debugging

### Open DevTools Console (F12)

When you refresh the page after login, you should see logs like:
```
✅ Login successful, token saved
🎵 Fetching songs with token: ***
Songs response status: 200
✅ Songs loaded: 0
```

If you see:
```
🎵 Fetching songs with token: NONE
```
→ Token is not in localStorage

### Check Network Requests:

1. Open Network tab (F12)
2. Perform action (login, upload, etc)
3. Look for any RED requests (failed)
4. Click on red request → "Response" tab to see error

Example response for 401:
```json
{
  "error": "No token provided"
}
```

---

## Step-by-Step Fix Process

### If Register fails (400):

1. ✅ Check server is running: `npm run dev`
2. ✅ Check .env file exists with JWT_SECRET
3. ✅ Try in DevTools console:
   ```javascript
   fetch('http://localhost:5000/api/auth/register', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({
       username: 'testuser',
       email: 'test@example.com',
       password: 'password123'
     })
   }).then(r => r.json()).then(d => console.log(d))
   ```
4. ✅ Check server console for error log
5. ✅ Delete database.db and restart server if database is corrupted

### If Upload fails (401):

1. ✅ Make sure you're logged in
2. ✅ Check localStorage has authToken:
   ```javascript
   console.log(localStorage.getItem('authToken'))
   ```
3. ✅ Check Network tab shows Authorization header with token
4. ✅ Try uploading a smaller file first
5. ✅ Check file is valid audio format (MP3, WAV, OGG)

---

## Quick Commands

```bash
# Start backend
cd d:\mini-song\backend
npm run dev

# Start frontend
cd d:\mini-song\frontend
python -m http.server 8000

# Clear database (if corrupted)
cd d:\mini-song\backend
del database.db
# Then restart server - it will recreate database

# Check database exists
ls database.db

# View recent logs (if using nodemon)
# Check terminal output from "npm run dev"
```

---

## Common Issues Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 8000  
- [ ] .env file exists in backend folder
- [ ] JWT_SECRET is set in .env
- [ ] Browser allows localhost connections
- [ ] CORS is enabled (should be in middleware)
- [ ] localStorage is not disabled in browser
- [ ] Database file exists or can be created
- [ ] No firewall blocking localhost:5000

---

## Still Having Issues?

1. **Check browser console (F12)**
   - Look for red error messages
   - Run provided diagnostic commands

2. **Check server console**
   - Logs should show request details
   - Look for ❌ or error messages

3. **Check Network tab (F12)**
   - See exact request/response
   - Check status codes and headers

4. **Try fresh start:**
   ```bash
   # Clean everything
   localStorage.clear()  # in DevTools console
   
   # Backend
   cd d:\mini-song\backend
   del database.db
   npm run dev
   
   # Frontend - reload
   Ctrl+Shift+R (hard refresh)
   ```

5. **Check logs are detailed:**
   - Console should print token value
   - Should show "✅" messages for success
   - Should show "❌" messages for errors
