import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthUser } from './types/auth-user.type';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.create(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@CurrentUser() user: User): AuthUser {
    return {
      userId: user.id,
      token: this.authService.getToken(user),
    };
  }
}
