'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoPlayer from '@/components/player/video-player';
import ChannelList from '@/components/player/channel-list';
import { parseM3U } from '@/utils/m3u-parser';
import type { Channel } from '@/types';

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchM3U = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy?url=' + encodeURIComponent('https://aktv.top/live.m3u'));
        if (!response.ok) throw new Error('Failed to fetch M3U file');
        
        const content = await response.text();
        const parsedChannels = parseM3U(content);
        if (parsedChannels.length === 0) {
          throw new Error('No channels found');
        }
        setChannels(parsedChannels);
        setError(null);
      } catch (error) {
        setError('加载频道列表失败');
        console.error('Error loading M3U:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchM3U().catch(console.error);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl text-red-600 mb-2">错误</h1>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>在线直播源播放器</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-2/3">
                <VideoPlayer 
                  url={selectedChannel?.url ?? null} 
                  onError={(msg) => setError(msg)} 
                />
                {error && (
                  <div className="mt-2 p-2 bg-red-50 text-red-600 rounded">
                    {error}
                  </div>
                )}
                {selectedChannel && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">{selectedChannel.title}</h3>
                    <p className="text-sm text-gray-500">分组: {selectedChannel.group}</p>
                  </div>
                )}
              </div>
              <div className="lg:w-1/3 h-[60vh]">
                <ChannelList
                  channels={channels}
                  selectedChannel={selectedChannel}
                  onSelect={setSelectedChannel}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  loading={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}