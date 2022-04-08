import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { GameStatus } from '../../game/types/game-status.enum';
import { MoveDto } from '../dtos/move.dto';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const moveDto = plainToClass(MoveDto, data);
        if (moveDto.game.gameStatus === GameStatus.USER_ONE_WINS)
          return { message: 'User One Wins', data: moveDto };

        if (moveDto.game.gameStatus === GameStatus.USER_TWO_WINS)
          return { message: 'User Two Wins', data: moveDto };

        if (moveDto.game.gameStatus === GameStatus.DRAW)
          return { message: 'Draw', data: moveDto };

        return {
          data,
        };
      }),
    );
  }
}
