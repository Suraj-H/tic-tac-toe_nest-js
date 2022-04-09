import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { CreateGameDto } from './dtos/create-game.dto';
import { Game } from './game.entity';
import { GameService } from './game.service';
import { CreateGameValidationPipe } from './pipes/create-game-validation.pipe';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard('jwt'))
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  async createGame(
    @CurrentUser() user: User,
    @Session() session,
    @Body('game', CreateGameValidationPipe) createGameDto: CreateGameDto,
  ): Promise<Game> {
    let game = session.currentGame;
    game = await this.gameService.createGame(game, user, createGameDto);
    session.currentGame = game;

    return game;
  }

  @Get('joinlist')
  getGamesToJoin(@CurrentUser() user: User): Promise<Game[]> {
    return this.gameService.getGamesToJoin(user);
  }

  @Patch(':id/join')
  async joinGame(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Session() session,
  ): Promise<Game> {
    let game = session.currentGame;
    game = await this.gameService.joinGame(game, user, +id);
    session.currentGame = game;

    return game;
  }

  @Get('list')
  getUserGames(@CurrentUser() user: User, @Query() query): Promise<Game[]> {
    return this.gameService.getUserGames(user, query);
  }

  @Patch('leave')
  async leaveGame(@CurrentUser() user: User, @Session() session) {
    let game = session.currentGame;
    game = this.gameService.leaveGame(user, game);
    session.currentGame = null;

    return game;
  }
}
