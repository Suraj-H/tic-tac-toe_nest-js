import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { ValidUser } from './types/valid-user.type';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger;

  constructor(private readonly authService: AuthService) {
    super();
    this.logger = new Logger(LocalStrategy.name);
  }

  async validate(username: string, password: string): Promise<ValidUser> {
    let user = await this.authService.validateUser(username, password);

    if (!user) {
      this.logger.debug(`User with name ${username} not found!`);
      throw new UnauthorizedException();
    }

    return user;
  }
}
