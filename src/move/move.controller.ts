import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { CreateMoveDto } from './dtos/create-move.dto';
import { MoveDto } from './dtos/move.dto';
import { WrapResponseInterceptor } from './interceptors/wrap-response.interceptor';
import { Move } from './move.entity';
import { MoveService } from './move.service';
import { CreateMoveValidationPipe } from './pipes/create-move-validation.pipe';
import { MovePosition } from './types/move-position';

@UseInterceptors(ClassSerializerInterceptor, WrapResponseInterceptor)
@UseGuards(AuthGuard('jwt'))
@Controller('move')
export class MoveController {
  constructor(private readonly moveService: MoveService) {}

  @Post('create')
  createMove(
    @CurrentUser() user: User,
    @Body(CreateMoveValidationPipe)
    createMoveDto: CreateMoveDto,
    @Session() session,
  ): Promise<Move> {
    const game = session.currentGame;

    return this.moveService.createMove(user, game, createMoveDto);
  }

  @Get('list')
  getMovesInGame(@Session() session): Promise<MoveDto[]> {
    const game = session.currentGame;

    return this.moveService.getMovesInGame(game);
  }

  @Get('check')
  validMoves(@Session() session, @CurrentUser() user: User): Promise<number[]> {
    const game = session.currentGame;

    return this.moveService.getUserMovePositionsInGame(game, user);
  }

  @Get('turn')
  userTurn(@Session() session): Promise<boolean> {
    const game = session.currentGame;

    return this.moveService.isUserTurn(game);
  }
}
