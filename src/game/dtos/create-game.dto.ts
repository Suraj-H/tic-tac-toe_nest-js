import { IsEnum, IsNotEmpty } from 'class-validator';
import { GameType } from '../types/game-type.enum';
import { PieceCode } from '../types/piece-code.enum';

export class CreateGameDto {
  @IsNotEmpty()
  @IsEnum(GameType)
  gameType: GameType;

  @IsNotEmpty()
  @IsEnum(PieceCode)
  userOnePieceCode: PieceCode;
}
