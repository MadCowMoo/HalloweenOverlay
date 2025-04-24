import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import StaticLightningCanvas from './StaticLightningCanvas';

const BUTTON_VISIBLE_MS = 3000;

export default function VideoPlayer({ settings = {}, onEditSettings }) {
  const {
    playlist = [],
    overlayFile = null,
    overlayAlpha,
    playlistLoop,
    overlayLoop,
    overlayDelay,
    playlistMuted = false,
    overlayMuted = false,
  } = settings;

  const [currentIdx, setCurrentIdx] = useState(0);


  const [showButton, setShowButton] = useState(true);
  const hideButtonTimeout = useRef();
  const playlistRef = useRef();
  const overlayRef = useRef();
  const overlayTimeout = useRef();
  const containerRef = useRef();

  // Show button on mouse move, then hide after delay
  useEffect(() => {
    function handleMouseMove() {
      setShowButton(true);
      clearTimeout(hideButtonTimeout.current);
      hideButtonTimeout.current = setTimeout(() => setShowButton(false), BUTTON_VISIBLE_MS);
    }
    window.addEventListener('mousemove', handleMouseMove);
    // Start hidden after delay
    hideButtonTimeout.current = setTimeout(() => setShowButton(false), BUTTON_VISIBLE_MS);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideButtonTimeout.current);
    };
  }, []);

  // Handle playlist video end
  function onPlaylistEnded() {
    if (currentIdx < playlist.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else if (playlistLoop && playlist.length > 0) {
      setCurrentIdx(0);
    } // else, stop at end
  }

  // Handle overlay video end
  function onOverlayEnded() {
    if (overlayLoop) {
      // Pause, wait for delay, then restart overlay video
      if (overlayRef.current) {
        overlayRef.current.pause();
        overlayTimeout.current = setTimeout(() => {
          overlayRef.current.currentTime = 0;
          overlayRef.current.play();
        }, overlayDelay * 1000);
      }
    }
  }

  // Clean up overlay timeout
  useEffect(() => {
    return () => clearTimeout(overlayTimeout.current);
  }, []);

  // Fullscreen on mount
  useEffect(() => {
    if (containerRef.current && containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  }, []);


  function getVideoURL(file) {
    // Only create object URL for File/Blob objects
    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    return '';
  }

  // When playlist files actually change, reset index
  useEffect(() => {
    // Create a unique signature for the playlist files
    const fileSig = playlist.map(f => f?.name + f?.size + f?.lastModified).join(';');
    setCurrentIdx(0);
    // eslint-disable-next-line
  }, [playlist.map(f => f?.name + f?.size + f?.lastModified).join(';')]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', height: '100vh', width: '100vw', background: '#000' }}
    >
      {/* Playlist video: always opaque and at the bottom */}
      <video
        ref={playlistRef}
        src={getVideoURL(playlist[currentIdx])}
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'contain',
          background: '#000',
          position: 'relative',
          zIndex: 1,
          opacity: 1
        }}
        autoPlay
        onEnded={onPlaylistEnded}
        controls={false}
        muted={playlistMuted}
      />
      {/* Overlay video: always on top, transparency applied */}
      {overlayFile ? (
        <video
          ref={overlayRef}
          src={getVideoURL(overlayFile)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'contain',
            pointerEvents: 'none',
            opacity: overlayAlpha,
            zIndex: 2
          }}
          autoPlay
          onEnded={onOverlayEnded}
          controls={false}
          muted={overlayMuted}
        />
      ) : (
        <StaticLightningCanvas overlayAlpha={overlayAlpha} />
      )}
      <Button
        variant="contained"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          opacity: showButton ? 1 : 0,
          pointerEvents: showButton ? 'auto' : 'none',
          transition: 'opacity 0.5s',
        }}
        onClick={onEditSettings}
      >
        Edit Settings
      </Button>
    </div>
  );
}

