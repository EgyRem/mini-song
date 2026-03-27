// API Base URL - configure based on environment
const API_BASE = (() => {
  const hostname = window.location.hostname;
  
  // Production: Use Vercel backend URL
  if (hostname === 'mini-song.vercel.app' || hostname.includes('vercel.app')) {
    return 'https://mini-song-api.vercel.app/api';
  }
  
  // Development: Use localhost
  return 'http://localhost:5000/api';
})();

console.log('API Base URL:', API_BASE);

class API {
  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  static getToken() {
    return localStorage.getItem('authToken');
  }

  static clearToken() {
    localStorage.removeItem('authToken');
  }

  static getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Auth
  static async register(username, email, password) {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Register failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Login failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Songs
  static async getSongs() {
    return this.getAllSongs();
  }

  static async getAllSongs() {
    try {
      const token = this.getToken();
      console.log('🎵 Fetching songs with token:', token ? '***' : 'NONE');
      
      const response = await fetch(`${API_BASE}/songs`, {
        headers: this.getHeaders()
      });
      
      console.log('Songs response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', response.status, error);
        return [];
      }
      
      const data = await response.json();
      console.log('✅ Songs loaded:', data.length);
      return data;
    } catch (error) {
      console.error('Failed to get songs:', error);
      return [];
    }
  }

  static async searchSongs(query) {
    try {
      const response = await fetch(`${API_BASE}/songs/search?q=${encodeURIComponent(query)}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to search songs:', error);
      return [];
    }
  }

  static async uploadSong(formData) {
    try {
      const token = this.getToken();
      console.log('📤 Uploading song with token:', token ? '***' : 'NONE');
      
      const response = await fetch(`${API_BASE}/songs/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Upload error:', response.status, error);
        throw new Error(error.error || `Upload failed: ${response.status}`);
      }

      console.log('✅ Upload successful');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteSong(songId) {
    try {
      const response = await fetch(`${API_BASE}/songs/${songId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getUserSongs(userId) {
    try {
      const response = await fetch(`${API_BASE}/songs/user/${userId}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get user songs:', error);
      return [];
    }
  }

  static async editSong(songId, formData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE}/songs/${songId}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Edit failed: ${response.status}`);
      }
      
      return { success: true, ...(await response.json()) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Playlists
  static async getPlaylists() {
    try {
      const response = await fetch(`${API_BASE}/playlists`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get playlists:', error);
      return [];
    }
  }

  static async createPlaylist(name, description = '') {
    try {
      const response = await fetch(`${API_BASE}/playlists`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name, description })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Create failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Admin
  static async getAdminStats() {
    try {
      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Stats failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  }

  static async updateUserRole(userId, role) {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Update failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getAllAdminSongs() {
    try {
      const response = await fetch(`${API_BASE}/admin/songs`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get songs:', error);
      return [];
    }
  }
}

