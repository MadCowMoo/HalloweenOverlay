import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Checkbox, FormControlLabel, Typography
} from '@mui/material';

const SETTINGS_KEY = 'video_overlay_player_settings';

export default function SettingsDialog({ onSave, savedSettings }) {
  const [playlist, setPlaylist] = useState([]);
  const [overlayFile, setOverlayFile] = useState(null);
  // Store last-used file names from last settings (not real File objects)
  const [lastPlaylistNames, setLastPlaylistNames] = useState([]);
  const [lastOverlayName, setLastOverlayName] = useState("");
  const [overlayAlpha, setOverlayAlpha] = useState(50);

  const [playlistLoop, setPlaylistLoop] = useState(false);
  const [playlistMuted, setPlaylistMuted] = useState(false);
  const [overlayLoop, setOverlayLoop] = useState(true);
  const [overlayMuted, setOverlayMuted] = useState(false);
  const [overlayDelay, setOverlayDelay] = useState(0);

  // Track settings load status
  const [settingsStatus, setSettingsStatus] = useState(null); // 'found' | 'notfound' | null

  // Track a key for the form to force re-render on settings load
  const [formKey, setFormKey] = useState(0);

  // Load from localStorage on mount (every time dialog is shown)
  React.useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      setSettingsStatus('found');
      try {
        const parsed = JSON.parse(saved);
        setOverlayAlpha(parsed.overlayAlpha !== undefined ? Math.round(parsed.overlayAlpha * 100) : 50);
        setPlaylistLoop(parsed.playlistLoop !== undefined ? parsed.playlistLoop : false);
        setPlaylistMuted(parsed.playlistMuted !== undefined ? parsed.playlistMuted : false);
        setOverlayLoop(parsed.overlayLoop !== undefined ? parsed.overlayLoop : true);
        setOverlayMuted(parsed.overlayMuted !== undefined ? parsed.overlayMuted : false);
        setOverlayDelay(parsed.overlayDelay !== undefined ? parsed.overlayDelay : 0);
        // Store last-used file names as a hint
        setLastPlaylistNames(parsed.lastPlaylistNames || []);
        setLastOverlayName(parsed.lastOverlayName || "");
        setFormKey(prev => prev + 1); // force form re-render
      } catch {}
    } else {
      setSettingsStatus('notfound');
      setOverlayAlpha(50);
      setPlaylistLoop(false);
      setPlaylistMuted(false);
      setOverlayLoop(true);
      setOverlayMuted(false);
      setOverlayDelay(0);
      setLastPlaylistNames([]);
      setLastOverlayName("");
      setFormKey(prev => prev + 1);
    }
    // Reset playlist and overlayFile each time
    setPlaylist([]);
    setOverlayFile(null);
  }, []);

  function handlePlaylistChange(e) {
    setPlaylist(Array.from(e.target.files));
  }

  function handleOverlayFileChange(e) {
    setOverlayFile(e.target.files[0] || null);
  }

  function handleSave() {
    if (playlist.length === 0) {
      alert('Please select at least one video for the playlist.');
      return;
    }
    // Save the file names for user reference
    const playlistNames = playlist.map(f => f.name);
    const overlayName = overlayFile ? overlayFile.name : "";
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        overlayAlpha: overlayAlpha / 100,
        playlistLoop,
        playlistMuted,
        overlayLoop,
        overlayMuted,
        overlayDelay: Number(overlayDelay),
        lastPlaylistNames: playlistNames,
        lastOverlayName: overlayName,
      })
    );
    onSave({
      playlist,
      overlayFile,
      overlayAlpha: overlayAlpha / 100, // Save as 0-1
      playlistLoop,
      playlistMuted,
      overlayLoop,
      overlayMuted,
      overlayDelay: Number(overlayDelay),
    });
  }

  return (
    <Dialog open fullWidth maxWidth="sm">
      <DialogTitle>Video Overlay Player Settings</DialogTitle>
      <div style={{ color: '#b00', fontSize: 12, marginTop: 4, marginBottom: 8, textAlign: 'center' }}>
        For privacy and security, you must re-select your video files each time you open the settings.
      </div>
      <DialogContent key={formKey}>

        <Typography variant="subtitle1" gutterBottom>Playlist Videos</Typography>
        <input
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          multiple
          onChange={handlePlaylistChange}
        />
        <ul>
          {playlist.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
        {lastPlaylistNames.length > 0 && playlist.length === 0 && (
          <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
            Last used: {lastPlaylistNames.join(', ')}
          </div>
        )}
        <FormControlLabel
          control={<Checkbox checked={playlistLoop} onChange={e => setPlaylistLoop(e.target.checked)} />}
          label="Loop Playlist"
        />
        <FormControlLabel
          control={<Checkbox checked={playlistMuted} onChange={e => setPlaylistMuted(e.target.checked)} />}
          label="Mute Playlist Video"
        />
        <Typography variant="subtitle1" gutterBottom>Overlay Video (optional)</Typography>
        <input
          type="file"
          accept="video/mp4"
          onChange={handleOverlayFileChange}
        />
        {overlayFile && <div>{overlayFile.name}</div>}
        <FormControlLabel
          control={<Checkbox checked={overlayMuted} onChange={e => setOverlayMuted(e.target.checked)} />}
          label="Mute Overlay Video"
        />
        {!overlayFile && lastOverlayName && (
          <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
            Last used: {lastOverlayName}
          </div>
        )}
        <TextField
          label="Overlay Transparency (%)"
          type="number"
          inputProps={{ min: 0, max: 100, step: 1 }}
          value={overlayAlpha}
          onChange={e => setOverlayAlpha(Math.max(0, Math.min(100, Number(e.target.value))))}
          fullWidth
          margin="normal"
          helperText="0 = fully transparent, 100 = fully opaque"
        />
        <TextField
          label="Overlay Loop Delay (seconds)"
          type="number"
          inputProps={{ min: 0, step: 0.1 }}
          value={overlayDelay}
          onChange={e => setOverlayDelay(e.target.value)}
          fullWidth
          margin="normal"
        />

        <FormControlLabel
          control={<Checkbox checked={overlayLoop} onChange={e => setOverlayLoop(e.target.checked)} />}
          label="Loop Overlay Video"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} variant="contained" color="primary">Start</Button>
      </DialogActions>
      <div style={{ minHeight: 24, marginTop: 8, marginBottom: 4, textAlign: 'center' }}>
        {settingsStatus === 'found' && (
          <span style={{ color: 'green', fontWeight: 'bold' }}>Settings loaded.</span>
        )}
        {settingsStatus === 'notfound' && (
          <span style={{ color: 'red', fontWeight: 'bold' }}>No settings found.</span>
        )}
      </div>
    </Dialog>
  );
}
