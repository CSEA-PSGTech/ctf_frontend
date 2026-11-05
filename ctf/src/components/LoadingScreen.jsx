import React, { useState, useEffect } from 'react';
import { LEFT_POSTERS, RIGHT_POSTERS } from '../postersData';

const ASSETS_TO_PRELOAD = [
  'https://db.onlinewebfonts.com/c/b9293bb81f83a7c7089fbfe957b198c7?family=Silentina+W00+Movie',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;500;600;700&display=swap',
];

const VIDEOS_TO_PRELOAD = [
  '/silent-film-bg.mp4',
];

export default function LoadingScreen({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Projector...');

  useEffect(() => {
    const posterImages = [
      ...LEFT_POSTERS.map((p) => p.image).filter(Boolean),
      ...RIGHT_POSTERS.map((p) => p.image).filter(Boolean),
    ];

    let loaded = 0;
    const total = ASSETS_TO_PRELOAD.length + VIDEOS_TO_PRELOAD.length + posterImages.length + 2; // +2 for font render & stage prep

    const tick = () => {
      loaded++;
      setProgress((prev) => Math.min(Math.round((loaded / total) * 100), 100));
    };

    const preload = async () => {
      // 1. Preload stylesheets
      setStatusText('Calibrating Vintage Fonts...');
      const cssPromises = ASSETS_TO_PRELOAD.map((url) =>
        new Promise((resolve) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = url;
          link.onload = () => { tick(); resolve(); };
          link.onerror = () => { tick(); resolve(); };
          setTimeout(() => { tick(); resolve(); }, 3000);
          document.head.appendChild(link);
        })
      );

      // 2. Preload silent movie background video
      setStatusText('Cueing Cinema Reel...');
      const videoPromises = VIDEOS_TO_PRELOAD.map((url) =>
        new Promise((resolve) => {
          const video = document.createElement('video');
          video.preload = 'auto';
          video.src = url;
          video.oncanplaythrough = () => { tick(); resolve(); };
          video.onerror = () => { tick(); resolve(); };
          setTimeout(() => { tick(); resolve(); }, 4000);
        })
      );

      // 3. Preload all movie posters for login screen
      setStatusText('Buffering Film Gallery...');
      const imagePromises = posterImages.map((url) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => { tick(); resolve(); };
          img.onerror = () => { tick(); resolve(); };
          setTimeout(() => { tick(); resolve(); }, 3000);
        })
      );

      await Promise.all([...cssPromises, ...videoPromises, ...imagePromises]);

      // 4. Wait for fonts to be ready
      setStatusText('Polishing Intertitles...');
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 2000)),
        ]);
      } catch (e) {
        // fallback
      }
      tick();

      setStatusText('Premiering Arena...');
      tick();
      setProgress(100);

      await new Promise((r) => setTimeout(r, 500));
      onFinished();
    };

    preload();
  }, [onFinished]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: '#0b0504',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#facc15',
      fontFamily: "'Silentina W00 Movie', Georgia, serif",
      fontStyle: 'italic',
      userSelect: 'none',
    }}>
      {/* Film grain vignette background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 50% 15%, rgba(180, 83, 9, 0.28) 0%, rgba(28, 10, 6, 0.85) 50%, #070302 100%),
          radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.08) 0%, transparent 65%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Title & Reel Indicator */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: '500px',
      }}>
        <div style={{
          display: 'inline-block',
          fontSize: '11px',
          letterSpacing: '4px',
          color: '#ca8a04',
          textTransform: 'uppercase',
          marginBottom: '16px',
          padding: '4px 14px',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          borderRadius: '20px',
          background: 'rgba(234, 179, 8, 0.06)',
        }}>
          • KOLLYWOOD PRE-FLIGHT REEL •
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 44px)',
          fontWeight: 900,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #fef08a 0%, #facc15 35%, #eab308 65%, #ca8a04 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
          filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9))',
          lineHeight: 1.15,
        }}>
          Kollywood CTF
        </h1>

        <p style={{
          fontSize: '13px',
          color: '#d6d3d1',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '32px',
          minHeight: '20px',
        }}>
          {statusText}
        </p>

        {/* Cinematic Golden Progress Bar */}
        <div style={{
          width: '100%',
          maxWidth: '320px',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '3px',
          overflow: 'hidden',
          margin: '0 auto',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          boxShadow: '0 0 16px rgba(0, 0, 0, 0.8), inset 0 1px 3px rgba(0, 0, 0, 0.8)',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #fde047 100%)',
            borderRadius: '3px',
            transition: 'width 0.25s ease-out',
            boxShadow: '0 0 12px rgba(250, 204, 21, 0.6)',
          }} />
        </div>

        <div style={{
          marginTop: '16px',
          fontSize: '13px',
          color: '#a8a29e',
          letterSpacing: '1.5px',
          fontWeight: 600,
        }}>
          {progress}% COMPLETED
        </div>
      </div>
    </div>
  );
}
