// Player Class
class Player {
  static play(song, playlist = []) {
    // Update songs list if playlist provided
    if (playlist && playlist.length > 0) {
      songs = playlist;
      currentSongIndex = playlist.findIndex(s => s.id === song.id);
      if (currentSongIndex === -1) {
        currentSongIndex = 0;
        songs.unshift(song);
      }
    }
    
    // Play the song
    playSong(currentSongIndex);
  }

  static getCurrentSong() {
    return songs[currentSongIndex] || null;
  }

  static getSongs() {
    return [...songs];
  }
}

// Player State
let currentSongIndex = 0;
let songs = [];
let isPlaying = false;

const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');

// Play/Pause
playBtn.addEventListener('click', togglePlay);

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    playBtn.textContent = '▶ Play';
    isPlaying = false;
  } else {
    // Handle play promise properly
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          playBtn.textContent = '⏸ Pause';
          isPlaying = true;
        })
        .catch((error) => {
          console.error('Play error:', error);
          isPlaying = false;
        });
    } else {
      playBtn.textContent = '⏸ Pause';
      isPlaying = true;
    }
  }
}

// Previous Song
prevBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong(currentSongIndex);
});

// Next Song
nextBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playSong(currentSongIndex);
});

// Progress Bar
progressBar.addEventListener('input', (e) => {
  const time = (e.target.value / 100) * audio.duration;
  audio.currentTime = time;
});

audio.addEventListener('timeupdate', () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.value = percent || 0;
  
  document.getElementById('current-time').textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  document.getElementById('duration').textContent = formatTime(audio.duration);
});

// Auto-play next song
audio.addEventListener('ended', () => {
  nextBtn.click();
});

// Volume
volumeSlider.addEventListener('input', (e) => {
  const volume = e.target.value / 100;
  audio.volume = volume;
  document.getElementById('volume-value').textContent = e.target.value + '%';
});

// Set initial volume
audio.volume = 0.7;

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function playSong(index) {
  if (!songs[index]) return;
  
  const song = songs[index];
  
  document.getElementById('song-title').textContent = song.title;
  document.getElementById('song-artist').textContent = song.artist;
  document.getElementById('song-album').textContent = song.album || 'Unknown Album';
  
  // Set audio source - construct full URL if needed
  let audioUrl = song.file_url || '';
  if (audioUrl && !audioUrl.startsWith('http')) {
    audioUrl = 'http://localhost:5000' + audioUrl;
  }
  audio.src = audioUrl;
  
  if (audio.src) {
    // Handle play promise properly to avoid AbortError
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          playBtn.textContent = '⏸ Pause';
          isPlaying = true;
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          isPlaying = false;
        });
    }
  }
  
  updateQueue(index);
}

function updateQueue(currentIndex) {
  const queueContainer = document.getElementById('queue-container');
  queueContainer.innerHTML = '';
  
  songs.forEach((song, index) => {
    const div = document.createElement('div');
    div.className = 'song-item' + (index === currentIndex ? ' playing' : '');
    div.innerHTML = `
      <div class="song-item-info">
        <p>${song.title}</p>
        <p>${song.artist}</p>
      </div>
      <span class="song-item-duration">${formatTime(song.duration || 0)}</span>
    `;
    div.addEventListener('click', () => {
      currentSongIndex = index;
      playSong(index);
    });
    queueContainer.appendChild(div);
  });
}

async function loadSongs() {
  try {
    const result = await API.getAllSongs();
    
    // Handle error response
    if (result.error) {
      console.error('Failed to load songs:', result.error);
      songs = [];
      return;
    }

    // Ensure result is an array
    songs = Array.isArray(result) ? result : [];
    updateQueue(0);
    
    if (songs.length > 0) {
      playSong(0);
    }
  } catch (error) {
    console.error('Failed to load songs:', error);
    songs = [];
  }
}
