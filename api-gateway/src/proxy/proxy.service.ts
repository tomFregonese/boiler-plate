import { Injectable } from '@nestjs/common';
import {
  createProxyMiddleware,
  RequestHandler,
  Options,
} from 'http-proxy-middleware';
import { ServiceConfig } from '../common/interfaces/service-config.interface.js';
import { SERVICES } from '../config/services.config.js';

@Injectable()
export class ProxyService {
  private readonly proxies: Map<string, RequestHandler> = new Map();

  constructor() {
    this.initializeProxies();
  }

  private initializeProxies(): void {
    for (const service of SERVICES) {
      const proxy = this.createProxy(service);
      this.proxies.set(service.name, proxy);
    }
  }

  private createProxy(config: ServiceConfig): RequestHandler {
    const options: Options = {
      target: config.target,
      changeOrigin: true,
      pathRewrite: config.pathRewrite,
      on: {
        proxyReq: (proxyReq, req) => {
          console.log(
            `[Proxy] ${req.method} ${req.url} -> ${config.target}${proxyReq.path}`,
          );
        },
        error: (err, req, res) => {
          console.error(`[Proxy Error] ${config.name}:`, err.message);
          if (res && 'writeHead' in res && typeof res.writeHead === 'function') {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                statusCode: 502,
                message: `Service ${config.name} unavailable`,
                error: 'Bad Gateway',
              }),
            );
          }
        },
      },
    };

    return createProxyMiddleware(options);
  }

  getProxy(serviceName: string): RequestHandler | undefined {
    return this.proxies.get(serviceName);
  }

  getServiceForPath(path: string): ServiceConfig | undefined {
    return SERVICES.find((service) => path.startsWith(service.prefix));
  }
}
