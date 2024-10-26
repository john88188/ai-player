import React, { useRef, useEffect } from 'react';
import { useHLSPlayer } from '@/hooks/use-hls-player';
import type { VideoPlayerProps } from '@/types';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useHLSPlayer(videoRef, url, onError);

  useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      }
    };
  }, [url]);

  if (!url) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">请选择一个频道开始播放</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        autoPlay
        muted
        style={{ backgroundColor: 'black' }}
      />
    </div>
  );
};

export default VideoPlayer;
