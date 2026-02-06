import { Module } from '@nestjs/common';
import { AuthAdapter } from './auth.adapter.js';
import { AuthProxyController } from './auth.controller.js';

@Module({
  controllers: [AuthProxyController],
  providers: [AuthAdapter],
})
export class AuthProxyModule {}
