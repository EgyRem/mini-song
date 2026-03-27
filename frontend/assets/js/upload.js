// Upload Song Form
document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('upload-title').value;
  const artist = document.getElementById('upload-artist').value;
  const album = document.getElementById('upload-album').value;
  const duration = document.getElementById('upload-duration').value;
  const file = document.getElementById('upload-file').files[0];
  const coverFile = document.getElementById('upload-cover').files[0];

  if (!title || !artist || !file) {
    alert('Please fill in title, artist, and select a file');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('artist', artist);
  formData.append('album', album);
  formData.append('duration', duration);
  formData.append('file', file);
  if (coverFile) {
    formData.append('cover_image', coverFile);
  }

  try {
    const statusDiv = document.getElementById('upload-status');
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<p style="color: var(--primary-color);">⏳ Uploading...</p>';

    const result = await API.uploadSong(formData);

    if (result.songId) {
      statusDiv.innerHTML = '<p style="color: var(--primary-color);">✅ Song uploaded successfully!</p>';
      
      // Reset form
      document.getElementById('upload-form').reset();
      
      // Reload songs in home view and profile
      setTimeout(() => {
        if (typeof loadAllSongs === 'function') {
          loadAllSongs();
        }
        if (typeof loadProfilePage === 'function') {
          loadProfilePage();
        }
        statusDiv.style.display = 'none';
      }, 2000);
    } else {
      statusDiv.innerHTML = `<p style="color: #ff6b6b;">❌ ${result.error || 'Upload failed'}</p>`;
    }
  } catch (error) {
    document.getElementById('upload-status').innerHTML = `<p style="color: #ff6b6b;">❌ Error: ${error.message}</p>`;
  }
});
