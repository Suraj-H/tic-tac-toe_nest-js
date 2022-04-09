import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { CreateGameDto } from './dtos/create-game.dto';
import { Game } from './game.entity';
import { GameStatus } from './types/game-status.enum';
import { GameType } from './types/game-type.enum';
import { PieceCode } from './types/piece-code.enum';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  ) {}

  createGame(
    currentGame: Game,
    currentUser: User,
    createGameDto: CreateGameDto,
  ): Promise<Game> {
    if (!currentUser) throw new NotFoundException('User not found.');

    if (currentGame)
      throw new BadRequestException(
        `You can't create a game, while you are in another game.`,
      );

    const { gameType, userOnePieceCode } = createGameDto;

    const game = this.gameRepository.create();
    game.userOne = currentUser;
    game.gameStatus = GameStatus.WAITS_FOR_USER;
    game.gameType = gameType;
    game.userOnePieceCode = userOnePieceCode;

    return this.gameRepository.save(game);
  }

  async getGamesToJoin(currentUser: User): Promise<Game[]> {
    if (!currentUser) throw new NotFoundException('User not found.');

    const games = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.userOne', 'userOne')
      .where('game.gameStatus = :gameStatus', {
        gameStatus: GameStatus.WAITS_FOR_USER,
      })
      .andWhere('game.gameType = :gameType', { gameType: GameType.COMPETITION })
      .andWhere('game.userOne.id != :userOneId', { userOneId: currentUser.id })
      .getMany();

    return games;
  }

  async joinGame(
    currentGame: Game,
    currentUser: User,
    id: number,
  ): Promise<Game> {
    if (!currentUser) throw new NotFoundException('User not found.');

    const game = await this.gameRepository.findOne(id, {
      relations: ['userOne', 'userTwo'],
    });

    if (game && game.userOne.id === currentUser.id)
      throw new BadRequestException(`You can't join your own game.`);

    if (game && game.userTwo && game.userTwo.id === currentUser.id)
      throw new BadRequestException(`You already joined this game.`);

    if (currentGame)
      throw new BadRequestException(
        `You can't join this game, while you are in another game.`,
      );

    if (!game) throw new NotFoundException(`Game with id #${id} not found.`);

    if (game.gameStatus === GameStatus.IN_PROGRESS)
      throw new BadRequestException(
        `Game with id #${id} is already in progress.`,
      );

    if (game.gameStatus !== GameStatus.WAITS_FOR_USER)
      throw new BadRequestException(`Game is already finished.`);

    game.userTwo = currentUser;
    game.gameStatus = GameStatus.IN_PROGRESS;

    return this.gameRepository.save(game);
  }

  leaveGame(currentUser: User, currentGame: Game): Promise<Game> {
    if (!currentUser) throw new NotFoundException('User not found.');
    if (!currentGame) throw new NotFoundException('Game not found.');

    if (
      currentGame.userOne.id !== currentUser.id &&
      currentGame.userTwo.id !== currentUser.id
    )
      throw new BadRequestException(`You can't leave this game.`);

    currentGame.gameStatus = GameStatus.ABORTED;
    currentGame.endedAt = new Date();

    return this.gameRepository.save(currentGame);
  }

  async getUserGames(currentUser: User, query): Promise<Game[]> {
    if (!currentUser) throw new NotFoundException('User not found.');

    const queryBuilder = this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.userOne', 'userOne')
      .leftJoinAndSelect('game.userTwo', 'userTwo')
      .where('game.userOne.id = :userOneId', { userOneId: currentUser.id })
      .orWhere('game.userTwo.id = :userTwoId', { userTwoId: currentUser.id });

    queryBuilder.orderBy('game.createdAt', 'DESC');

    if (query.limit) queryBuilder.limit(query.limit);

    if (query.offset) queryBuilder.offset(query.offset);

    const games = await queryBuilder.getMany();

    return games;
  }
}
