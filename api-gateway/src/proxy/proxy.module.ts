import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service.js';
import { ProxyMiddleware } from './proxy.middleware.js';

@Module({
  providers: [ProxyService, ProxyMiddleware],
  exports: [ProxyService, ProxyMiddleware],
})
export class ProxyModule {}
