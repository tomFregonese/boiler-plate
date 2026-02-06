import { Body, Controller, Get, Post, Put, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthAdapter } from './auth.adapter.js';
import { CreateAccountDto } from './dtos/create-account.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { UpdateAccountDto } from './dtos/update-account.dto.js';

@Controller('api/auth')
export class AuthProxyController {
  constructor(private readonly auth: AuthAdapter) {}

  @Post('account')
  createAccount(
    @Body() _body: CreateAccountDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, '/account');
  }

  @Post('token')
  getToken(
    @Body() _body: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, '/token');
  }

  @Post('refresh-token/:refreshToken/token')
  refreshToken(
    @Param('refreshToken') refreshToken: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, `/refresh-token/${refreshToken}/token`);
  }

  @Get('validate/:accessToken')
  validate(
    @Param('accessToken') accessToken: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, `/validate/${accessToken}`);
  }

  @Get('account/:uid')
  getAccount(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, `/account/${uid}`);
  }

  @Put('account/:uid')
  updateAccount(
    @Body() _body: UpdateAccountDto,
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, `/account/${uid}`);
  }
}
