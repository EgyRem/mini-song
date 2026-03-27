// Update user profile in sidebar and topbar dynamically
function updateUserProfile(username, email, role) {
  const initial = username ? username.charAt(0).toUpperCase() : 'U';
  
  // Update sidebar profile
  document.getElementById('profile-username').textContent = username;
  document.getElementById('profile-email').textContent = email;
  document.getElementById('profile-role').textContent = role || 'user';
  document.getElementById('sidebar-avatar').textContent = initial;
  
  // Update topbar avatar
  document.getElementById('topbar-avatar').textContent = initial;
}

// Navigation - Updated for new class names
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    if (view === 'logout') {
      // Logout will be handled by auth.js
      return;
    }
    
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    btn.classList.add('active');
    const viewElement = document.getElementById(view);
    if (viewElement) {
      viewElement.classList.add('active');
    }
    
    if (view === 'playlists') {
      loadPlaylists();
    } else if (view === 'admin') {
      loadAdminDashboard();
    } else if (view === 'profile') {
      loadProfilePage();
    }
  });
});

// Search - Updated for new structure
document.getElementById('topbar-search') && document.getElementById('topbar-search').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (!query) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }
  
  // Switch to search view
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  
  const searchNav = document.querySelector('[data-view="search"]');
  if (searchNav) searchNav.classList.add('active');
  document.getElementById('search').classList.add('active');
  
  try {
    const results = await API.searchSongs(query);
    displaySearchResults(results);
  } catch (error) {
    console.error('Search error:', error);
  }
});

function displaySearchResults(results) {
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  
  if (results.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 24px;">No songs found</p>';
    return;
  }
  
  results.forEach((song, index) => {
    const div = document.createElement('div');
    div.className = 'song-item';
    const coverEmoji = ['🎵', '🎸', '💿', '🎤', '🎧', '🎹', '🥁', '📻'][index % 8];
    const coverFullUrl = song.cover_image_url ? `http://localhost:5000${song.cover_image_url}` : null;
    const coverImg = coverFullUrl ? `<img src="${coverFullUrl}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 50%; margin-bottom: 8px;" crossorigin="anonymous">` : `<div style="font-size: 3em; margin-bottom: 8px; text-align: center;">${coverEmoji}</div>`;
    const uploaderName = song.uploader || song.username || 'Unknown';
    
    div.innerHTML = `
      ${coverImg}
      <h4 style="margin: 8px 0; text-align: center; font-size: 0.95rem;">${song.title}</h4>
      <p style="font-size: 0.85rem; color: var(--text-secondary); text-align: center; margin: 4px 0;">${song.artist}</p>
      <p style="font-size: 0.75rem; color: var(--text-tertiary); text-align: center; margin: 2px 0;">by ${uploaderName}</p>
    `;
    div.addEventListener('click', () => {
      Player.play(song, results);
    });
    container.appendChild(div);
  });
}

// Playlists
document.getElementById('create-playlist-btn').addEventListener('click', async () => {
  const name = prompt('Playlist name:');
  if (!name) return;
  
  try {
    const result = await API.createPlaylist(name);
    if (result.playlistId) {
      loadPlaylists();
      alert('Playlist created!');
    }
  } catch (error) {
    console.error('Failed to create playlist:', error);
  }
});

async function loadPlaylists() {
  try {
    const playlists = await API.getPlaylists();
    displayPlaylists(playlists);
  } catch (error) {
    console.error('Failed to load playlists:', error);
  }
}

function displayPlaylists(playlists) {
  const container = document.getElementById('playlists-container');
  container.innerHTML = '';
  
  if (playlists.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 24px;">No playlists yet. Create one!</p>';
    return;
  }
  
  playlists.forEach(playlist => {
    const div = document.createElement('div');
    div.className = 'playlist-card';
    div.style.cssText = `
      background: linear-gradient(135deg, #1db954 0%, #1aa34a 100%);
      cursor: pointer;
      padding: 20px;
      border-radius: 12px;
      color: white;
      transition: 0.3s ease;
      box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
    `;
    div.innerHTML = `
      <div style="font-size: 2.5em; margin-bottom: 12px;">🎵</div>
      <h4 style="margin: 8px 0; font-size: 1.1rem;">${playlist.name}</h4>
      <p style="font-size: 0.85rem; opacity: 0.9; margin: 4px 0;">${playlist.description || 'No description'}</p>
      <p style="font-size: 0.75rem; opacity: 0.7; margin-top: 8px;">0 songs</p>
    `;
    div.addEventListener('mouseenter', () => {
      div.style.transform = 'translateY(-4px)';
      div.style.boxShadow = '0 8px 16px rgba(29, 185, 84, 0.4)';
    });
    div.addEventListener('mouseleave', () => {
      div.style.transform = 'translateY(0)';
      div.style.boxShadow = '0 4px 12px rgba(29, 185, 84, 0.3)';
    });
    container.appendChild(div);
  });
}

// Load songs from API and display in home view
async function loadAllSongs() {
  try {
    const songsData = await API.getSongs();
    songs = songsData;
    displaySongs(songsData);
    return songsData;
  } catch (error) {
    console.error('Failed to load songs:', error);
    return [];
  }
}

// Display songs in grid
function displaySongs(songsData) {
  const container = document.getElementById('home');
  if (!container) return;
  
  let grid = container.querySelector('.songs-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'songs-grid';
    grid.style.cssText = 'padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px;';
    container.appendChild(grid);
  }
  
  grid.innerHTML = '';
  
  if (!songsData || songsData.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 24px;">No songs available</p>';
    return;
  }
  
  songsData.forEach((song, index) => {
    const div = document.createElement('div');
    div.className = 'song-item';
    const coverEmoji = ['🎵', '🎸', '💿', '🎤', '🎧', '🎹', '🥁', '📻'][index % 8];
    const coverImg = song.cover_image_url ? `<img src="${song.cover_image_url}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">` : `<div style="font-size: 3em; margin-bottom: 8px; text-align: center;">${coverEmoji}</div>`;
    const uploaderName = song.uploader || song.username || 'Unknown';
    
    div.innerHTML = `
      ${coverImg}
      <h4 style="margin: 8px 0; text-align: center; font-size: 0.95rem;">${song.title}</h4>
      <p style="font-size: 0.85rem; color: var(--text-secondary); text-align: center; margin: 4px 0;">${song.artist}</p>
      <p style="font-size: 0.75rem; color: var(--text-tertiary); text-align: center; margin: 2px 0;">by ${uploaderName}</p>
    `;
    div.addEventListener('click', () => {
      Player.play(song, songsData);
    });
    grid.appendChild(div);
  });
}

// Load admin dashboard
async function loadAdminDashboard() {
  if (typeof AdminDashboard !== 'undefined' && AdminDashboard.load) {
    await AdminDashboard.load();
  }
}

// Profile View Functions
async function loadProfilePage() {
  try {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    
    // Update profile header
    const initial = username ? username.charAt(0).toUpperCase() : 'U';
    document.getElementById('profile-avatar-large').textContent = initial;
    document.getElementById('profile-username-large').textContent = username || 'User';
    document.getElementById('profile-email-large').textContent = userEmail || 'user@email.com';
    document.getElementById('profile-role-large').textContent = userRole === 'admin' ? 'Administrator' : 'Regular User';
    
    // Load user's songs
    const userSongs = await API.getUserSongs(userId);
    displayUserSongs(userSongs, userId);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

function displayUserSongs(songs, userId) {
  const container = document.getElementById('profile-songs');
  container.innerHTML = '';
  
  if (!songs || songs.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">You haven\'t uploaded any songs yet</p>';
    return;
  }
  
  songs.forEach(song => {
    const div = document.createElement('div');
    div.className = 'song-item';
    const coverEmoji = ['🎵', '🎸', '💿', '🎤', '🎧', '🎹', '🥁', '📻'][Math.floor(Math.random() * 8)];
    const coverFullUrl = song.cover_image_url ? `http://localhost:5000${song.cover_image_url}` : null;
    const coverImg = coverFullUrl ? `<img src="${coverFullUrl}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 50%; margin-bottom: 8px;" crossorigin="anonymous">` : `<div style="font-size: 3em; margin-bottom: 8px; text-align: center;">${coverEmoji}</div>`;
    
    div.innerHTML = `
      ${coverImg}
      <h4 style="margin: 8px 0; text-align: center; font-size: 0.95rem;">${song.title}</h4>
      <p style="font-size: 0.85rem; color: var(--text-secondary); text-align: center; margin: 4px 0;">${song.artist}</p>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <button class="btn-edit-song" data-song-id="${song.id}" style="flex: 1; padding: 6px; font-size: 0.8rem;">✏️ Edit</button>
        <button class="btn-delete-song" data-song-id="${song.id}" style="flex: 1; padding: 6px; font-size: 0.8rem;">🗑️ Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
  
  // Add event listeners for edit/delete
  document.querySelectorAll('.btn-edit-song').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const songId = btn.dataset.songId;
      const song = songs.find(s => s.id == songId);
      showEditForm(song);
    });
  });
  
  document.querySelectorAll('.btn-delete-song').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const songId = btn.dataset.songId;
      if (confirm('Are you sure you want to delete this song?')) {
        try {
          await API.deleteSong(songId);
          alert('Song deleted successfully');
          loadProfilePage();
        } catch (error) {
          alert('Failed to delete song: ' + error.message);
        }
      }
    });
  });
}

function showEditForm(song) {
  const formContainer = document.getElementById('edit-form-container');
  formContainer.style.display = 'block';
  
  document.getElementById('edit-title').value = song.title;
  document.getElementById('edit-artist').value = song.artist;
  document.getElementById('edit-album').value = song.album || '';
  
  // Store current song ID in a data attribute
  document.getElementById('edit-song-form').dataset.songId = song.id;
}

// Handle edit form submission
document.getElementById('edit-song-form') && document.getElementById('edit-song-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const songId = e.target.dataset.songId;
  const title = document.getElementById('edit-title').value;
  const artist = document.getElementById('edit-artist').value;
  const album = document.getElementById('edit-album').value;
  const coverFile = document.getElementById('edit-cover').files[0];
  
  try {
    const statusDiv = document.getElementById('edit-status');
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<p style="color: var(--primary-color);">⏳ Saving changes...</p>';
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album);
    if (coverFile) {
      formData.append('cover_image', coverFile);
    }
    
    const result = await API.editSong(songId, formData);
    
    if (result.success) {
      statusDiv.innerHTML = '<p style="color: var(--primary-color);">✅ Changes saved successfully!</p>';
      setTimeout(() => {
        statusDiv.style.display = 'none';
        document.getElementById('edit-form-container').style.display = 'none';
        loadProfilePage();
      }, 1500);
    } else {
      statusDiv.innerHTML = `<p style="color: #ff6b6b;">❌ ${result.error || 'Failed to save'}</p>`;
    }
  } catch (error) {
    document.getElementById('edit-status').innerHTML = `<p style="color: #ff6b6b;">❌ Error: ${error.message}</p>`;
    document.getElementById('edit-status').style.display = 'block';
  }
});

// Cancel edit form
document.getElementById('cancel-edit-btn') && document.getElementById('cancel-edit-btn').addEventListener('click', () => {
  document.getElementById('edit-form-container').style.display = 'none';
  document.getElementById('edit-status').style.display = 'none';
});

// Initialize: Load songs if user is already logged in
if (API.getToken()) {
  console.log('🎵 User is logged in, loading songs...');
  loadAllSongs().catch(err => console.error('Failed to load songs on init:', err));
}
