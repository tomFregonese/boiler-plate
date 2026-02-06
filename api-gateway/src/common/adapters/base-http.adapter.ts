import { Request, Response } from 'express';

const FORWARDED_HEADERS = [
  'x-api-key',
  'x-user-id',
  'x-user-role',
  'content-type',
  'accept',
  'authorization',
] as const;

export abstract class BaseHttpAdapter {
  protected abstract readonly serviceName: string;
  protected abstract readonly baseUrl: string;

  async forward(req: Request, res: Response, targetPath: string): Promise<void> {
    const url = this.buildUrl(targetPath, req.query as Record<string, string>);
    const headers = this.extractHeaders(req);
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

    if (hasBody) {
      headers['content-type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        method: req.method,
        headers,
        body: hasBody ? JSON.stringify(req.body) : undefined,
      });

      if (response.status === 204) {
        res.status(204).end();
        return;
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const body = await response.json();
        res.status(response.status).json(body);
      } else {
        const body = await response.text();
        res.status(response.status).send(body);
      }
    } catch (error) {
      console.error(`[${this.serviceName}] Network error:`, (error as Error).message);
      res.status(502).json({
        statusCode: 502,
        message: `Service ${this.serviceName} unavailable`,
        error: 'Bad Gateway',
      });
    }
  }

  private buildUrl(targetPath: string, query: Record<string, string>): string {
    const qs = new URLSearchParams(query).toString();
    return `${this.baseUrl}${targetPath}${qs ? `?${qs}` : ''}`;
  }

  private extractHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};
    for (const key of FORWARDED_HEADERS) {
      const value = req.headers[key];
      if (typeof value === 'string') {
        headers[key] = value;
      }
    }
    return headers;
  }
}
