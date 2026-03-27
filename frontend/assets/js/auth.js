// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById(`${tab}-form`).classList.add('active');
  });
});

// Login Form
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    console.log('🔐 Attempting login with:', email);
    const result = await API.login(email, password);
    
    console.log('Login response:', result);
    
    if (result.token) {
      API.setToken(result.token);
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('username', result.username);
      localStorage.setItem('userEmail', email || result.email || 'user@example.com');
      localStorage.setItem('userRole', result.role);
      
      console.log('✅ Login successful, token saved');
      showAppSection();
      displayUserInfo(result.username, result.role);
      // loadSongs() will be called from app.js after all scripts load
    } else {
      alert(result.error || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    alert('Login error: ' + error.message);
  }
});

// Register Form
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  console.log('📝 Attempting register:', { username, email });
  
  if (!username || username.length < 3) {
    alert('Username must be at least 3 characters');
    return;
  }
  
  if (!password || password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  try {
    const result = await API.register(username, email, password);
    
    console.log('Register response:', result);
    
    if (result.token) {
      API.setToken(result.token);
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('username', username);
      localStorage.setItem('userEmail', email || 'user@example.com');
      localStorage.setItem('userRole', result.role);
      
      console.log('✅ Register successful, token saved');
      showAppSection();
      displayUserInfo(username, result.role);
      // loadSongs() will be called from app.js after all scripts load
    } else {
      alert(result.error || 'Registration failed');
    }
  } catch (error) {
    console.error('❌ Register error:', error);
    alert('Registration error: ' + error.message);
  }
});

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    API.clearToken();
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('app-section').style.display = 'none';
    
    // Reset app UI
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Clear game state
    if (typeof loadSongs === 'function') {
      // Reset to home view on login
    }
  });
}

function showAppSection() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('app-section').style.display = 'flex';
}

function displayUserInfo(username, role) {
  document.getElementById('profile-username').textContent = username || 'User';
  document.getElementById('profile-email').textContent = localStorage.getItem('userEmail') || 'user@example.com';
  const profileRole = document.getElementById('profile-role');
  if (profileRole) {
    profileRole.textContent = role || 'user';
  }
  
  // Update topbar avatar with first letter of username
  const initial = username ? username.charAt(0).toUpperCase() : 'U';
  const avatarElements = document.querySelectorAll('.avatar, .topbar-avatar, #sidebar-avatar, #topbar-avatar');
  avatarElements.forEach(el => {
    el.textContent = initial;
  });
  
  // Show admin nav button if user is admin
  const adminBtn = document.getElementById('admin-nav-btn');
  if (adminBtn) {
    adminBtn.style.display = role === 'admin' ? 'flex' : 'none';
  }
}

// Check if user is already logged in
if (API.getToken()) {
  showAppSection();
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');
  if (username && userRole) {
    displayUserInfo(username, userRole);
    // loadSongs() is called from app.js after all scripts are loaded
  }
}
