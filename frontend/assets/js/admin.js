// Admin Panel Functions
async function loadAdminDashboard() {
  try {
    const stats = await API.getAdminStats();
    displayAdminStats(stats);
    displayAdminUsers(stats.users);
    
    const songs = await API.getAllAdminSongs();
    displayAdminSongs(songs);
  } catch (error) {
    console.error('Failed to load admin dashboard:', error);
    document.getElementById('admin-stats').innerHTML = `<p style="color: #ff6b6b;">Error loading stats: ${error.message}</p>`;
  }
}

function displayAdminStats(stats) {
  const container = document.getElementById('admin-stats');
  container.innerHTML = `
    <div class="stat-card">
      <h4>👥 Total Users</h4>
      <p class="stat-number">${stats.totalUsers}</p>
    </div>
    <div class="stat-card">
      <h4>🎵 Total Songs</h4>
      <p class="stat-number">${stats.totalSongs}</p>
    </div>
    <div class="stat-card">
      <h4>📊 Avg Songs/User</h4>
      <p class="stat-number">${stats.stats.avgSongsPerUser.toFixed(2)}</p>
    </div>
  `;
}

function displayAdminUsers(users) {
  const container = document.getElementById('admin-users');
  
  if (!users || users.length === 0) {
    container.innerHTML = '<p>No users found</p>';
    return;
  }

  let html = '<table class="admin-table"><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>';
  
  users.forEach(user => {
    html += `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>
          <select class="role-select" data-user-id="${user.id}" value="${user.role}">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </td>
        <td>
          <button class="btn-role-update" data-user-id="${user.id}">Update</button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  // Add role update listeners
  document.querySelectorAll('.btn-role-update').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const userId = e.target.dataset.userId;
      const roleSelect = document.querySelector(`select[data-user-id="${userId}"]`);
      const newRole = roleSelect.value;

      try {
        await API.updateUserRole(userId, newRole);
        alert(`User role updated to ${newRole}`);
        loadAdminDashboard();
      } catch (error) {
        alert(`Error updating role: ${error.message}`);
      }
    });
  });
}

function displayAdminSongs(songs) {
  const container = document.getElementById('admin-songs');

  if (!songs || songs.length === 0) {
    container.innerHTML = '<p>No songs found</p>';
    return;
  }

  let html = '<table class="admin-table"><thead><tr><th>Title</th><th>Artist</th><th>Album</th><th>User ID</th></tr></thead><tbody>';
  
  songs.forEach(song => {
    html += `
      <tr>
        <td>${song.title}</td>
        <td>${song.artist}</td>
        <td>${song.album || '-'}</td>
        <td>${song.user_id || 'Global'}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// Add styles for admin table
const style = document.createElement('style');
style.textContent = `
  .admin-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--border-color);
    border-radius: 6px;
    overflow: hidden;
  }

  .admin-table th {
    background: #404040;
    padding: 12px;
    text-align: left;
    font-weight: 600;
  }

  .admin-table td {
    padding: 12px;
    border-bottom: 1px solid #404040;
  }

  .admin-table tr:hover {
    background: #303030;
  }

  .role-select {
    padding: 6px;
    background: #404040;
    color: var(--text-color);
    border: 1px solid #535353;
    border-radius: 4px;
  }

  .btn-role-update {
    padding: 6px 12px;
    background: var(--primary-color);
    border: none;
    color: var(--secondary-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }

  .btn-role-update:hover {
    background: #1ed760;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }

  .stat-card {
    background: var(--border-color);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }

  .stat-card h4 {
    margin-bottom: 10px;
    color: var(--text-secondary);
  }

  .stat-number {
    font-size: 2em;
    color: var(--primary-color);
    font-weight: bold;
  }

  .admin-section {
    margin: 30px 0;
    background: var(--border-color);
    padding: 20px;
    border-radius: 8px;
  }

  .admin-section h3 {
    margin-bottom: 20px;
    border-bottom: 1px solid #404040;
    padding-bottom: 10px;
  }
`;
document.head.appendChild(style);
