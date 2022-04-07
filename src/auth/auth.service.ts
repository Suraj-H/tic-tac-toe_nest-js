import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { ValidUser } from './types/valid-user.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<ValidUser | null> {
    const user = await this.userRepository.findOne({ username: username });

    if (user && bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email } = createUserDto;

    let user = await this.userRepository.findOne({ email, username });
    if (user) throw new BadRequestException('user already registered.');

    user = this.userRepository.create({
      ...createUserDto,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    return this.userRepository.save(user);
  }

  getToken(user: User): string {
    return this.jwtService.sign({
      username: user.username,
      sub: user.id,
    });
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
