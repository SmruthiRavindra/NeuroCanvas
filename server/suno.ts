import fetch from 'node-fetch';

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';
const SUNO_API_KEY = process.env.SUNO_API_KEY;

if (!SUNO_API_KEY) {
  console.warn('⚠️  SUNO_API_KEY not found - music generation will fail');
}

export interface SunoGenerateRequest {
  prompt: string;
  customMode?: boolean;
  instrumental?: boolean;
  style?: string;
  title?: string;
  model?: 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5';
  vocalGender?: 'm' | 'f';
  styleWeight?: number;
  callbackUrl?: string;
}

export interface SunoTrack {
  id: string;
  title: string;
  audio_url: string;
  video_url: string;
  image_url: string;
  lyrics: string;
  duration: number;
  tags: string;
  prompt: string;
  status: 'queued' | 'streaming' | 'complete' | 'error';
  error_message?: string;
}

export interface SunoGenerateResponse {
  task_id: string;
  status: string;
  tracks?: SunoTrack[];
}

export interface SunoTaskStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  tracks?: SunoTrack[];
  error_message?: string;
}

export class SunoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || SUNO_API_KEY || '';
    this.baseUrl = SUNO_API_BASE;
  }

  async generateMusic(request: SunoGenerateRequest): Promise<SunoGenerateResponse> {
    if (!this.apiKey) {
      throw new Error('Suno API key is not configured');
    }

    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        customMode: request.customMode ?? true,
        instrumental: request.instrumental ?? false,
        style: request.style || 'Ambient',
        title: request.title || 'Untitled',
        model: request.model || 'V4_5',
        vocalGender: request.vocalGender,
        styleWeight: request.styleWeight ?? 0.7,
        callbackUrl: request.callbackUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Suno API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as SunoGenerateResponse;
    return data;
  }

  async getTaskStatus(taskId: string): Promise<SunoTaskStatus> {
    if (!this.apiKey) {
      throw new Error('Suno API key is not configured');
    }

    const response = await fetch(`${this.baseUrl}/music/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Suno API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as SunoTaskStatus;
    return data;
  }

  async waitForCompletion(taskId: string, maxAttempts = 60, intervalMs = 5000): Promise<SunoTaskStatus> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getTaskStatus(taskId);

      if (status.status === 'complete') {
        return status;
      }

      if (status.status === 'error') {
        throw new Error(status.error_message || 'Music generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Music generation timed out');
  }
}

export const sunoClient = new SunoClient();
