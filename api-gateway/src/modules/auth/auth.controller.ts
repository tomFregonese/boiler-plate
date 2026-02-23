import {Body, Controller, Get, Post, Put, Param, Req, Res, HttpCode, HttpStatus} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthAdapter } from './auth.adapter.js';
import { CreateAccountDto } from './dtos/create-account.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { UpdateAccountDto } from './dtos/update-account.dto.js';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";

@Controller('api/auth')
export class AuthProxyController {
  constructor(private readonly auth: AuthAdapter) {}

  @Post('account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'Account created' })
  @ApiResponse({ status: 409, description: 'Login already exists' })
  createAccount(
    @Body() _body: CreateAccountDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, '/account');
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get token pair' })
  @ApiResponse({ status: 200, description: 'Returns accessToken and refreshToken' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  getToken(
    @Body() _body: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, '/token');
  }

  @Post('refresh-token/:refreshToken/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiParam({ name: 'refreshToken', description: 'The refresh token UUID' })
  @ApiResponse({ status: 200, description: 'New token pair returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refreshToken(
    @Param('refreshToken') refreshToken: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, `/refresh-token/${refreshToken}/token`);
  }

  @Get('validate/:accessToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an access token' })
  @ApiParam({ name: 'accessToken', description: 'The JWT access token to validate' })
  @ApiResponse({ status: 200, description: 'Token is valid, returns payload' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  validate(
    @Param('accessToken') accessToken: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, `/validate/${accessToken}`);
  }

  @Get('account/:uid')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user account by ID' })
  @ApiParam({ name: 'uid', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User account returned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getAccount(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, `/account/${uid}`);
  }

  @Put('account/:uid')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user account' })
  @ApiParam({ name: 'uid', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Account updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateAccount(
    @Body() _body: UpdateAccountDto,
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.auth.forward(req, res, `/account/${uid}`);
  }
}
