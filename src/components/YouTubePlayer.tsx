import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  controls?: boolean;
  modestbranding?: boolean;
  rel?: boolean;
  showinfo?: boolean;
  className?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  width = '100%',
  height = '100%',
  autoplay = false,
  controls = true,
  modestbranding = true,
  rel = false,
  showinfo = false,
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getEmbedUrl = () => {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: controls ? '1' : '0',
      modestbranding: modestbranding ? '1' : '0',
      rel: rel ? '1' : '0',
      showinfo: showinfo ? '1' : '0',
      iv_load_policy: '3', // Hide annotations
      cc_load_policy: '0', // Hide captions by default
      fs: '1', // Allow fullscreen
      playsinline: '1' // Play inline on mobile
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  useEffect(() => {
    // Update iframe src when videoId changes
    if (iframeRef.current) {
      iframeRef.current.src = getEmbedUrl();
    }
  }, [videoId, autoplay, controls, modestbranding, rel, showinfo]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <iframe
        ref={iframeRef}
        src={getEmbedUrl()}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
        loading="lazy"
      />
    </div>
  );
};

export default YouTubePlayer;