import React, { useState } from 'react';
import { Search, Loader2, Play, Tv, Hash, Clock } from 'lucide-react';
import type { ChannelListProps } from '@/types';

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  selectedChannel,
  onSelect,
  searchTerm,
  onSearch,
  loading = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const filteredChannels = channels.filter(channel =>
    channel.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedChannels = filteredChannels.reduce((acc, channel, index) => {
    const group = channel.group || '其他';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({ ...channel, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<any>>);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
      <div className="p-4 border-b border-slate-200/50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
          <input
            type="text"
            placeholder="搜索频道..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => onSearch('')}
                className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors duration-200"
              >
                <span className="text-xs text-slate-600">×</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Tv size={14} />
            {filteredChannels.length} 个频道
          </span>
          {Object.keys(groupedChannels).length > 1 && (
            <span className="flex items-center gap-1">
              <Hash size={14} />
              {Object.keys(groupedChannels).length} 个分组
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="text-slate-600 font-medium">加载频道列表中...</p>
              <p className="text-slate-400 text-sm mt-1">请稍候</p>
            </div>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-medium">没有找到匹配的频道</p>
              <p className="text-slate-400 text-sm mt-1">尝试调整搜索关键词</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedChannels).map(([groupName, groupChannels]) => (
              <div key={groupName} className="space-y-2">
                {Object.keys(groupedChannels).length > 1 && (
                  <div className="sticky top-0 z-10 bg-slate-100/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200/50">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Hash size={14} className="text-slate-500" />
                      {groupName}
                      <span className="text-xs text-slate-500 ml-auto">
                        {groupChannels.length}
                      </span>
                    </h3>
                  </div>
                )}
                
                <div className="space-y-1">
                  {groupChannels.map((channel, index) => {
                    const isSelected = selectedChannel?.url === channel.url;
                    const globalIndex = channel.originalIndex;
                    const isHovered = hoveredIndex === globalIndex;
                    
                    return (
                      <button
                        key={`${groupName}-${index}`}
                        onClick={() => onSelect(channel)}
                        onMouseEnter={() => setHoveredIndex(globalIndex)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`group w-full p-3 text-left rounded-xl transition-all duration-200 relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                            : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent" />
                        )}
                        
                        <div className="relative z-10 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isSelected 
                              ? 'bg-white/20 backdrop-blur-sm' 
                              : 'bg-slate-100 group-hover:bg-slate-200'
                          }`}>
                            {isSelected ? (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            ) : (
                              <Tv className={`w-5 h-5 transition-colors duration-200 ${
                                isHovered ? 'text-blue-500' : 'text-slate-500'
                              }`} />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm truncate transition-colors duration-200 ${
                              isSelected ? 'text-white' : 'text-slate-800 group-hover:text-slate-900'
                            }`}>
                              {channel.title}
                            </div>
                            <div className={`text-xs truncate mt-0.5 transition-colors duration-200 ${
                              isSelected ? 'text-white/80' : 'text-slate-500 group-hover:text-slate-600'
                            }`}>
                              {channel.group}
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="flex items-center gap-1 text-white/80">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <span className="text-xs font-medium">播放中</span>
                            </div>
                          )}
                        </div>
                        
                        {(isHovered && !isSelected) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {filteredChannels.length > 0 && (
        <div className="p-3 border-t border-slate-200/50 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              实时更新
            </span>
            <span>支持 HLS 直播流</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelList;