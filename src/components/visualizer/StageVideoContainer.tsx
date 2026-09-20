import React, { useState } from 'react';
import { TrimesterVisualExperience } from '../../types';

interface StageVideoContainerProps {
  experience: TrimesterVisualExperience;
  activeWeek: number;
}

export const StageVideoContainer: React.FC<StageVideoContainerProps> = ({
  experience,
  activeWeek
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  const videoSrc = experience.mediaAsset?.videoUrl || '/animations/fetal-development.mp4';
  const stillSrc = experience.mediaAsset?.posterPlaceholder?.startsWith('/')
    ? experience.mediaAsset.posterPlaceholder
    : '/animations/fetal-development-still.jpg';

  return (
    <div className="relative w-full h-[260px] rounded-[28px] overflow-hidden bg-[#0D1520] flex items-center justify-center select-none shadow-[inset_0_2px_12px_rgba(0,0,0,0.4)] group">
      {/* ── Soft Volumetric Glow Lighting (Pink + Blue Rim) ── */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none transition-all duration-700 animate-pulse"
        style={{ background: 'rgba(234, 129, 170, 0.35)' }}
      />
      <div
        className="absolute -bottom-12 -right-12 w-52 h-52 rounded-full blur-3xl opacity-45 pointer-events-none transition-all duration-700 animate-pulse"
        style={{ background: 'rgba(56, 189, 248, 0.35)' }}
      />

      {/* ── High-End Medical Video Element ── */}
      {!videoError && (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onCanPlayThrough={() => setIsVideoLoaded(true)}
          onError={() => {
            setVideoError(true);
            setIsVideoLoaded(false);
          }}
          className={`relative z-10 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
          }`}
        />
      )}

      {/* ── Photorealistic 3D Medical Developmental Fallback ── */}
      {(!isVideoLoaded || videoError) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
          <img
            src={stillSrc}
            alt="3D Fetal Developmental Visualization"
            className="w-full h-full object-cover animate-gentle-breathe filter contrast-105 brightness-95 transition-all duration-1000"
          />
          {/* Subtle cinematic radial vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1520]/80 via-transparent to-[#0D1520]/40 pointer-events-none" />
        </div>
      )}

      {/* ── Medical Telemetry Overlay ── */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
          3D Evaluation • Week {activeWeek}
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] font-medium text-white/75 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
          Amniotic Volumetric Depth
        </span>
        <span className="text-[10px] font-semibold text-[#EA81AA] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
          Sensory Reception Active
        </span>
      </div>

      {/* Subtle depth vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none z-20" />
    </div>
  );
};
