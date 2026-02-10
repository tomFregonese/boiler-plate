import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class OmdbClient {
  private readonly omdbBaseUrl = 'https://www.omdbapi.com/';

  async request<T>(
    params: Record<string, string | number | undefined>,
  ): Promise<T> {
    const apiKey = this.getApiKey();
    const url = new URL(this.omdbBaseUrl);
    url.searchParams.set('apikey', apiKey);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && String(value).trim() !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    let response: Response;
    try {
      response = await fetch(url.toString());
    } catch (error) {
      throw new ServiceUnavailableException(
        `OMDB request failed: ${error instanceof Error ? error.message : error}`,
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `OMDB request failed with status ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }

  private getApiKey(): string {
    const apiKey = process.env.OMDBAPI_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OMDBAPI_KEY is missing. Set it in the environment.',
      );
    }
    return apiKey;
  }
}
