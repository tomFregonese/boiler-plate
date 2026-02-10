import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserDto } from '../../application/dto/register-user.dto';
import { LoginUserDto } from '../../application/dto/login-user.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email validation and password hashing. Default role is CLIENT.',
  })
  @ApiBody({
    type: RegisterUserDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data (invalid email, password too short, etc.)',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email already in use',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    },
  })
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user with email and password. Verifies that the account is active.',
  })
  @ApiBody({
    type: LoginUserDto,
    description: 'Login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or inactive account',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body() dto: LoginUserDto) {
    return this.loginUserUseCase.execute(dto);
  }
}
