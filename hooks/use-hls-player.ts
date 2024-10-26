import { useEffect, useRef } from 'react';
import type Hls from 'hls.js';

let HlsModule: typeof Hls | null = null;
if (typeof window !== 'undefined') {
  import('hls.js').then(module => {
    HlsModule = module.default;
    console.log('HLS module loaded:', HlsModule); // 调试日志
  });
}

export const useHLSPlayer = (
  videoRef: React.RefObject<HTMLVideoElement>,
  url: string | null,
  onError?: (error: string) => void
) => {
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!url || !videoRef.current || !HlsModule) return;

    const video = videoRef.current;

    const initializeHLS = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      if (HlsModule.isSupported()) {
        const hls = new HlsModule({
          enableWorker: false,
          maxBufferSize: 0,
          maxBufferLength: 30,
          liveSyncDuration: 3,
          liveMaxLatencyDuration: 6,
          liveDurationInfinity: true,
          highBufferWatchdogPeriod: 1,
          xhrSetup: (xhr: XMLHttpRequest, url: string) => {
            if (url.includes('aktv.top')) {
              xhr.open('GET', `/api/proxy?url=${encodeURIComponent(url)}`, true);
            }
          }
        });
    
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(HlsModule.Events.ERROR, (_: any, data: any) => {
          if (data.fatal) {
            console.error('HLS Error:', data);
            if (data.type === HlsModule.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === HlsModule.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              onError?.('播放失败，请尝试其他频道');
            }
          }
        });

        hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => {
            console.error('Auto play failed:', e);
          });
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => {
            console.error('Auto play failed:', e);
          });
        });
      } else {
        onError?.('您的浏览器不支持播放此视频');
      }
    };

    try {
      initializeHLS();
    } catch (error) {
      console.error('HLS initialization error:', error);
      onError?.('播放器初始化失败');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeEventListener('loadedmetadata', () => {});
    };
  }, [url, videoRef, onError]);

  return hlsRef;
};
