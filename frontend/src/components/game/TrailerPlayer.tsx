'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { MovieItem } from '@/types/game';

interface TrailerPlayerProps {
  movie: MovieItem;
  poster?: string;
  autoPlay?: boolean;
}

export default function TrailerPlayer({ movie, poster, autoPlay = false }: TrailerPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsPlaying(autoPlay);
    setHasError(false);
    if (videoRef.current) {
      if (autoPlay) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [movie, autoPlay]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const posterImage = poster || movie.thumbnail;

  return (
    <div
      role="region"
      aria-label={`Trailer player: ${movie.name}`}
      className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl group select-none"
    >
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 text-center">
          <p className="text-sm font-semibold text-slate-200 mb-1">
            Unable to stream trailer preview
          </p>
          <p className="text-xs text-slate-400 mb-4 max-w-sm">
            The video source may be temporarily unavailable or restricted by browser codecs.
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              videoRef.current?.load();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Playback</span>
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            poster={posterImage}
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          >
            {movie.mp4_url && <source src={movie.mp4_url} type="video/mp4" />}
            {movie.webm_url && <source src={movie.webm_url} type="video/webm" />}
            Your browser does not support HTML5 video streaming.
          </video>

          {/* Top Title Overlay */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none">
            <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-md truncate block max-w-lg">
              {movie.name}
            </span>
          </div>

          {/* Center Play Button Overlay when paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play video overlay"
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 hover:scale-110 transition-all border border-indigo-400/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            >
              <Play className="w-7 h-7 fill-white ml-1" />
            </button>
          )}

          {/* Bottom Glass Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent flex items-center justify-between transition-opacity duration-300">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-white/20 text-white border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-white/20 text-white border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleFullscreen}
              aria-label="Fullscreen video"
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-white/20 text-white border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
