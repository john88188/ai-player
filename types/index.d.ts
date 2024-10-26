export interface Channel {
    group: string;
    title: string;
    url: string;
  }
  
  export interface VideoPlayerProps {
    url: string | null;
    onError?: (error: string) => void;
  }
  
  export interface ChannelListProps {
    channels: Channel[];
    selectedChannel: Channel | null;
    onSelect: (channel: Channel) => void;
    searchTerm: string;
    onSearch: (term: string) => void;
    loading?: boolean;
  }