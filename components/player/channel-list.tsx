import React from 'react';
import { Search } from 'lucide-react';
import type { ChannelListProps } from '@/types';

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  selectedChannel,
  onSelect,
  searchTerm,
  onSearch,
  loading = false,
}) => {
  const filteredChannels = channels.filter(channel =>
    channel.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="搜索频道..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>加载频道列表中...</p>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p>没有找到匹配的频道</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChannels.map((channel, index) => (
              <button
                key={index}
                onClick={() => onSelect(channel)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  selectedChannel?.url === channel.url
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{channel.title}</div>
                <div className="text-sm text-opacity-80">{channel.group}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;