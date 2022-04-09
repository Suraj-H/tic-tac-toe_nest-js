import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { GameType } from '../types/game-type.enum';
import { PieceCode } from '../types/piece-code.enum';

export class CreateGameValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { gameType, userOnePieceCode } = value;

    if (gameType !== GameType.COMPETITION && gameType !== GameType.COMPUTER)
      throw new BadRequestException(
        'Game type must be COMPETITION or COMPUTER',
      );

    if (userOnePieceCode !== PieceCode.X && userOnePieceCode !== PieceCode.O)
      throw new BadRequestException('Piece code must be X or O.');

    return value;
  }
}
