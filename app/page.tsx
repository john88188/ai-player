'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoPlayer from '@/components/player/video-player';
import ChannelList from '@/components/player/channel-list';
import { parseM3U } from '@/utils/m3u-parser';
import { Play, Tv, Link, Loader2, AlertTriangle, RefreshCw, Info, ExternalLink, Copy, Check } from 'lucide-react';
import type { Channel } from '@/types';

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('https://aktv.top/live.m3u');
  const [inputType, setInputType] = useState<'m3u'|'m3u8'|null>(null);
  const [showUrlGuide, setShowUrlGuide] = useState(false);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  useEffect(() => {
    if (!inputUrl) return;
    const fetchSource = async () => {
      try {
        setLoading(true);
        setError(null);
        // 判断类型
        let type: 'm3u'|'m3u8'|null = null;
        if (inputUrl.endsWith('.m3u8')) type = 'm3u8';
        else if (inputUrl.endsWith('.m3u')) type = 'm3u';
        setInputType(type);
        if (type === 'm3u') {
          const response = await fetch('/api/proxy?url=' + encodeURIComponent(inputUrl));
          if (!response.ok) throw new Error('无法获取 M3U 列表');
          const content = await response.text();
          const parsedChannels = parseM3U(content);
          if (parsedChannels.length === 0) throw new Error('未找到频道');
          setChannels(parsedChannels);
          setSelectedChannel(parsedChannels[0]);
        } else if (type === 'm3u8') {
          // 单个播放源，构造频道列表
          setChannels([{ title: '自定义播放源', url: inputUrl, group: '自定义' }]);
          setSelectedChannel({ title: '自定义播放源', url: inputUrl, group: '自定义' });
        } else {
          throw new Error('请输入正确的 m3u 或 m3u8 链接');
        }
      } catch (error: any) {
        setChannels([]);
        setSelectedChannel(null);
        setError(error?.message || '加载失败');
        console.error('Error loading source:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSource();
  }, [inputUrl]);

  const urlExamples = [
    {
      type: 'M3U8 带参数',
      url: 'http://198.16.64.10:8278/arirang_twn/playlist.m3u8?tid=MF5F3988861839888618&ct=19249&tsum=781d490a6abe9f48f5b93e211cbe0307',
      description: '带认证参数的直播流'
    },
    {
      type: 'M3U8 简单',
      url: 'https://example.com/live/stream.m3u8',
      description: '标准HLS直播流'
    },
    {
      type: 'M3U 播放列表',
      url: 'https://aktv.top/live.m3u',
      description: '包含多个频道的播放列表'
    }
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(type);
      setTimeout(() => setCopiedExample(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 错误提示不再全屏，集成到主界面

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8 animate-fade-in-up">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg glow hover:scale-110 transition-all duration-300">
                <Play className="w-6 h-6 text-white ml-0.5" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-fade-in-scale">
                AI Player
              </h1>
            </div>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms]">
              现代化的在线直播源播放器，支持 HLS 流媒体播放
            </p>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-sm overflow-hidden animate-fade-in-up [animation-delay:300ms] hover:shadow-3xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200">
                <Link className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-800">播放源配置</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="inputUrl" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Tv className="w-4 h-4" />
                  播放源链接
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      id="inputUrl"
                      type="text"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm bg-white/50 backdrop-blur-sm placeholder:text-slate-400"
                      value={inputUrl}
                      onChange={e => setInputUrl(e.target.value)}
                      placeholder="输入 M3U 或 M3U8 链接，如：https://example.com/live.m3u"
                      disabled={loading}
                    />
                    {loading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    className="sm:w-32 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    onClick={() => {
                      if (inputUrl.trim()) {
                        setInputUrl(inputUrl.trim());
                      }
                    }}
                    disabled={loading || !inputUrl.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">加载中</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">加载</span>
                      </>
                    )}
                  </button>
                </div>
                
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium">加载失败</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-slate-100 rounded-full">支持 M3U 播放列表</span>
                  <span className="px-2 py-1 bg-slate-100 rounded-full">支持 M3U8 直播流</span>
                  <span className="px-2 py-1 bg-slate-100 rounded-full">HLS 协议</span>
                  <button
                    onClick={() => setShowUrlGuide(!showUrlGuide)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors duration-200"
                  >
                    <Info size={12} />
                    URL格式说明
                  </button>
                </div>
                
                {showUrlGuide && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">播放源URL格式说明</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-sm text-slate-700">
                        <p className="mb-2">播放源链接通常包含以下部分：</p>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs overflow-x-auto">
                          <div className="text-blue-600 whitespace-nowrap">http://198.16.64.10:8278/arirang_twn/playlist.m3u8</div>
                          <div className="text-green-600 whitespace-nowrap">?tid=MF5F3988861839888618&ct=19249&tsum=781d490a6abe9f48f5b93e211cbe0307</div>
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div><span className="text-blue-600 font-medium">蓝色部分:</span> 基础URL，包含服务器地址和文件路径</div>
                          <div><span className="text-green-600 font-medium">绿色部分:</span> 查询参数，用于认证和配置</div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-slate-800 mb-2">常见URL示例：</h5>
                        <div className="space-y-2">
                          {urlExamples.map((example, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-600">{example.type}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => copyToClipboard(example.url, example.type)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors duration-200"
                                  >
                                    {copiedExample === example.type ? (
                                      <>
                                        <Check size={12} className="text-green-600" />
                                        已复制
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} />
                                        复制
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setInputUrl(example.url);
                                      setShowUrlGuide(false);
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors duration-200"
                                  >
                                    <ExternalLink size={12} />
                                    使用
                                  </button>
                                </div>
                              </div>
                              <div className="font-mono text-xs text-slate-700 break-all mb-1 bg-slate-50 p-2 rounded border overflow-x-auto whitespace-nowrap lg:whitespace-normal lg:break-all">
                                {example.url}
                              </div>
                              <div className="text-xs text-slate-500">{example.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-amber-800">
                            <div className="font-medium mb-1">注意事项：</div>
                            <ul className="space-y-0.5 list-disc list-inside">
                              <li>确保URL以 .m3u 或 .m3u8 结尾</li>
                              <li>带参数的URL需要完整复制，包括所有查询参数</li>
                              <li>某些播放源可能需要特定的认证参数才能正常播放</li>
                              <li>如果链接失效，请联系播放源提供方获取新链接</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowUrlGuide(false)}
                          className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors duration-200"
                        >
                          关闭说明
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm overflow-hidden animate-fade-in-up [animation-delay:400ms] hover:shadow-3xl transition-all duration-500">
              <CardContent className="p-6">
                <VideoPlayer 
                  url={selectedChannel?.url ?? null} 
                  onError={(msg) => setError(msg)} 
                />
                {selectedChannel && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Tv className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{selectedChannel.title}</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <span>分组:</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {selectedChannel.group}
                          </span>
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">正在播放</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {channels.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm animate-fade-in-up [animation-delay:500ms] hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Tv className="w-5 h-5 text-blue-500 hover:scale-110 transition-transform duration-200" />
                    播放统计
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 hover:scale-105 transition-all duration-200 cursor-pointer">
                      <div className="text-2xl font-bold text-blue-600">{channels.length}</div>
                      <div className="text-xs text-blue-600">总频道数</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 hover:scale-105 transition-all duration-200 cursor-pointer">
                      <div className="text-2xl font-bold text-green-600">
                        {new Set(channels.map(c => c.group)).size}
                      </div>
                      <div className="text-xs text-green-600">分组数量</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 hover:scale-105 transition-all duration-200 cursor-pointer">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedChannel ? '1' : '0'}
                      </div>
                      <div className="text-xs text-purple-600">正在播放</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 hover:scale-105 transition-all duration-200 cursor-pointer">
                      <div className="text-2xl font-bold text-orange-600">HLS</div>
                      <div className="text-xs text-orange-600">流媒体协议</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="xl:col-span-1 animate-slide-in-right [animation-delay:600ms]">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm h-full hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Tv className="w-5 h-5 text-blue-500 hover:scale-110 transition-transform duration-200" />
                  频道列表
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4 h-[calc(100vh-400px)] min-h-[500px]">
                <ChannelList
                  channels={channels}
                  selectedChannel={selectedChannel}
                  onSelect={setSelectedChannel}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}