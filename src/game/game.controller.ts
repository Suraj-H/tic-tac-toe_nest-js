import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { Game } from './game.entity';
import { GameService } from './game.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard('jwt'))
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  async createGame(
    @CurrentUser() user: User,
    @Session() session,
  ): Promise<Game> {
    const game = await this.gameService.createGame(user);
    session.currentGame = game;

    return game;
  }

  @Get('list')
  getGamesList(@CurrentUser() user: User): Promise<Game[]> {
    return this.gameService.getGamesToJoin(user);
  }

  @Patch(':id/join')
  async joinGame(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Session() session,
  ): Promise<Game> {
    const game = await this.gameService.joinGame(user, +id);
    session.currentGame = game;

    return game;
  }

  @Get('user/list')
  getUserGames(@CurrentUser() user: User): Promise<Game[]> {
    return this.gameService.getUserGames(user);
  }
}
