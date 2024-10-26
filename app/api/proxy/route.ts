import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'http://aktv.top',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'http://aktv.top'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 如果请求的是 .m3u8 文件，则处理为文本
    if (url.endsWith('.m3u8')) {
      const data = await response.text();
      
      // 检查并处理 m3u8 文件中的相对路径
      const baseUrl = new URL(url).origin;
      const pathParts = new URL(url).pathname.split('/');
      pathParts.pop();
      const basePath = pathParts.join('/');
      
      const processedData = data.split('\n').map(line => {
        if (line.trim().startsWith('http')) {
          return line;
        }
        if (line.trim() && !line.startsWith('#')) {
          if (line.startsWith('/')) {
            return `${baseUrl}${line}`;
          }
          return `${baseUrl}${basePath}/${line}`;
        }
        return line;
      }).join('\n');

      return new NextResponse(processedData, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // 对于 .ts 文件或其他内容，处理为二进制流
    const buffer = await response.arrayBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Error fetching content', { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Referer',
      'Access-Control-Max-Age': '86400'
    }
  });
}
