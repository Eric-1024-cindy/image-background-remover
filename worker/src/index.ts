/**
 * Cloudflare Worker: Remove.bg API Proxy
 * Accepts image data and returns result from Remove.bg API
 */

const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export interface Env {
  REMOVE_BG_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return Response.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    try {
      const body = await request.json() as { image?: string };
      const { image } = body;

      if (!image) {
        return Response.json(
          { success: false, error: 'Missing image data' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Extract base64 data from data URL
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      // Create form data for Remove.bg API
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('image_file', blob, 'image.png');
      formData.append('size', 'auto');
      formData.append('format', 'png');

      const apiKey = env.REMOVE_BG_API_KEY || REMOVE_BG_API_KEY;

      const response = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Remove.bg API error:', errorText);

        if (response.status === 402) {
          return Response.json(
            { success: false, error: 'API 额度已用完，请明天再来或使用自己的 API Key' },
            { status: 402, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return Response.json(
          { success: false, error: '处理失败，请稍后重试' },
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const resultBuffer = await response.arrayBuffer();
      const resultBase64 = btoa(String.fromCharCode(...new Uint8Array(resultBuffer)));
      const resultDataUrl = `data:image/png;base64,${resultBase64}`;

      return Response.json(
        { success: true, result: resultDataUrl },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (error) {
      console.error('Worker error:', error);
      return Response.json(
        { success: false, error: '处理超时，请稍后重试' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
