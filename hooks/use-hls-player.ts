import { useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';

let HlsModule: typeof Hls | null = null;
let isLoading = false;

export const useHLSPlayer = (
  videoRef: React.RefObject<HTMLVideoElement>,
  url: string | null,
  onError?: (error: string) => void
) => {
  const hlsRef = useRef<Hls | null>(null);
  const [hlsLoaded, setHlsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !HlsModule && !isLoading) {
      isLoading = true;
      import('hls.js').then(module => {
        HlsModule = module.default;
        setHlsLoaded(true);
        console.log('HLS module loaded successfully');
      }).catch(error => {
        console.error('Failed to load HLS module:', error);
        isLoading = false;
      });
    } else if (HlsModule) {
      setHlsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!url || !videoRef.current) return;
    if (typeof window === 'undefined') return;

    const video = videoRef.current;

    const initializeHLS = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (HlsModule && HlsModule.isSupported()) {
        try {
          const hls = new HlsModule({
            enableWorker: false,
            maxBufferSize: 0,
            maxBufferLength: 30,
            liveSyncDuration: 3,
            liveMaxLatencyDuration: 6,
            liveDurationInfinity: true,
            highBufferWatchdogPeriod: 1,
            debug: false,
            xhrSetup: (xhr: XMLHttpRequest, requestUrl: string) => {
              if (requestUrl.includes('aktv.top')) {
                xhr.open('GET', `/api/proxy?url=${encodeURIComponent(requestUrl)}`, true);
              }
            }
          });
      
          hlsRef.current = hls;
          
          hls.on(HlsModule.Events.ERROR, (_: any, data: any) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              switch (data.type) {
                case HlsModule.ErrorTypes.NETWORK_ERROR:
                  console.log('Trying to recover from network error');
                  hls.startLoad();
                  break;
                case HlsModule.ErrorTypes.MEDIA_ERROR:
                  console.log('Trying to recover from media error');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error, cannot recover');
                  onError?.('播放失败，请尝试其他频道');
                  break;
              }
            }
          });

          hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
            console.log('Manifest parsed, starting playback');
            video.play().catch(e => {
              console.warn('Auto play failed:', e);
            });
          });

          hls.loadSource(url);
          hls.attachMedia(video);
        } catch (error) {
          console.error('Error creating HLS instance:', error);
          onError?.('HLS播放器初始化失败');
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('Using native HLS support');
        video.src = url;
        const loadedHandler = () => {
          video.play().catch(e => {
            console.warn('Auto play failed:', e);
          });
          video.removeEventListener('loadedmetadata', loadedHandler);
        };
        video.addEventListener('loadedmetadata', loadedHandler);
      } else {
        onError?.('您的浏览器不支持播放此视频格式');
      }
    };

    if (HlsModule || hlsLoaded) {
      try {
        initializeHLS();
      } catch (error) {
        console.error('HLS initialization error:', error);
        onError?.('播放器初始化失败');
      }
    } else {
      console.log('Waiting for HLS module to load...');
    }

    return () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
          hlsRef.current = null;
        } catch (error) {
          console.error('Error destroying HLS instance:', error);
        }
      }
      
      video.src = '';
      video.load();
    };
  }, [url, videoRef, onError, hlsLoaded]);

  return hlsRef;
};
