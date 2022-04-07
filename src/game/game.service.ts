import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Game } from './game.entity';
import { GameStatus } from './types/game-status.enum';
import { GameType } from './types/game-type.enum';
import { PieceCode } from './types/piece-code.enum';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  ) {}

  createGame(currentUser: User): Promise<Game> {
    if (!currentUser) throw new BadRequestException('User not found.');

    const game = this.gameRepository.create();
    game.userOne = currentUser;
    game.gameStatus = GameStatus.WAITS_FOR_USER;
    game.gameType = GameType.COMPETITION;
    game.userOnePieceCode = PieceCode.X;
    game.created = new Date();

    return this.gameRepository.save(game);
  }

  async getGameToJoin(currentUser: User): Promise<Game[] | null> {
    if (!currentUser) throw new BadRequestException('User not found.');

    let games = await this.gameRepository.find({
      gameStatus: GameStatus.WAITS_FOR_USER,
      gameType: GameType.COMPETITION,
    });

    if (!games) return null;

    return games.filter((game) => game.userOne !== currentUser);
  }

  async joinGame(currentUser: User, id: number): Promise<Game> {
    if (!currentUser) throw new BadRequestException('User not found.');

    const game = await this.gameRepository.findOne(id, {
      relations: ['userOne'],
    });

    if (!game) throw new NotFoundException(`Game with id#${id} not found.`);

    if (game.gameStatus !== GameStatus.WAITS_FOR_USER)
      throw new BadRequestException(`Game is already finished.`);

    game.userTwo = currentUser;
    game.gameStatus = GameStatus.IN_PROGRESS;

    return this.gameRepository.save(game);
  }
}
