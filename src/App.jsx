import React, { useState, useEffect } from 'react';
import SettingsDialog from './SettingsDialog';
import VideoPlayer from './VideoPlayer';

const SETTINGS_KEY = 'video_overlay_player_settings';

export default function App() {
  const [settings, setSettings] = useState(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Files cannot be saved, so ignore playlist/overlayFile here
        setSettings(parsed);
      } catch {}
    }
  }, []);

  function handleSave(newSettings) {
    // Save all settings except playlist and overlayFile (files can't be saved)
    console.log('saving settings', newSettings);
    const { playlist, overlayFile, ...rest } = newSettings;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));
    setSettings(newSettings);
  }

  function handleEditSettings() {
    setSettings(null);
  }

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#000' }}>
      {!settings ? (
        <SettingsDialog onSave={handleSave} savedSettings={settings} />
      ) : (
        <VideoPlayer settings={settings} onEditSettings={handleEditSettings} />
      )}
    </div>
  );
}
