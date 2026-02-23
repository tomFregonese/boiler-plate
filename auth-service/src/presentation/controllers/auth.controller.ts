import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';
import { GetAccountUseCase } from '../../application/use-cases/get-account.use-case';
import { UpdateAccountUseCase } from '../../application/use-cases/update-account.use-case';
import { RegisterUserDto } from '../../application/dto/register-user.dto';
import { LoginUserDto } from '../../application/dto/login-user.dto';
import { UpdateAccountDto } from '../../application/dto/update-account.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly getAccountUseCase: GetAccountUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
  ) {}

  @Post('account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'Account created' })
  @ApiResponse({ status: 409, description: 'Login already exists' })
  async createAccount(@Body() dto: RegisterUserDto) {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get token pair' })
  @ApiResponse({ status: 200, description: 'Returns accessToken and refreshToken' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async getToken(@Body() dto: LoginUserDto) {
    return this.loginUserUseCase.execute(dto);
  }

  @Post('refresh-token/:refreshToken/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiParam({ name: 'refreshToken', description: 'The refresh token UUID' })
  @ApiResponse({ status: 200, description: 'New token pair returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Param('refreshToken') refreshToken: string) {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  @Get('validate/:accessToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an access token' })
  @ApiParam({ name: 'accessToken', description: 'The JWT access token to validate' })
  @ApiResponse({ status: 200, description: 'Token is valid, returns payload' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  validateToken(@Param('accessToken') accessToken: string) {
    return this.validateTokenUseCase.execute(accessToken);
  }

  @Get('account/:uid')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user account by ID' })
  @ApiParam({ name: 'uid', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User account returned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getAccount(@Param('uid') uid: string) {
    return this.getAccountUseCase.execute(uid);
  }

  @Put('account/:uid')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user account' })
  @ApiParam({ name: 'uid', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Account updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateAccount(@Param('uid') uid: string, @Body() dto: UpdateAccountDto) {
    return this.updateAccountUseCase.execute(uid, dto);
  }
}
