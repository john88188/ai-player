import { Channel } from '@/types';

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
      const match = line.match(/group-title="([^"]*)".*,\s*(.*)/);
      if (match) {
        currentChannel = {
          group: match[1],
          title: match[2],
        };
      }
    } else if (line.startsWith('http')) {
      if (currentChannel.group && currentChannel.title) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }
  });

  return channels;
};

export const cn = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};