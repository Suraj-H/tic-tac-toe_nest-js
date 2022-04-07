import { Game } from '../../game/game.entity';
import { PieceCode } from '../../game/types/piece-code.enum';
import { User } from '../../user/user.entity';

// export class MoveDto {
//   boardRow: number;
//   boardColumn: number;
//   created: Date;
//   user: User;
//   game: Game;
//   userPieceCode: PieceCode;
// }

export class MoveDto {
  position: number;
  created: Date;
  user: User;
  game: Game;
  userPieceCode: PieceCode;
}
