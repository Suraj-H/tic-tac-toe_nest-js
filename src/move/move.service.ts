import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../game/game.entity';
import { GameStatus } from '../game/types/game-status.enum';
import { GameType } from '../game/types/game-type.enum';
import { PieceCode } from '../game/types/piece-code.enum';
import { User } from '../user/user.entity';
import { CreateMoveDto } from './dtos/create-move.dto';
import { MoveDto } from './dtos/move.dto';
import { Move } from './move.entity';
import { MovePosition } from './types/move-position';

@Injectable()
export class MoveService {
  constructor(
    @InjectRepository(Move) private readonly moveRepository: Repository<Move>,
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  ) {}

  async createMove(
    currentUser: User,
    currentGame: Game,
    createMoveDto: CreateMoveDto,
  ): Promise<Move> {
    if (!currentGame) throw new BadRequestException('Game not found.');
    if (!currentUser) throw new BadRequestException('User not found.');

    const { row, column } = createMoveDto;

    let move = this.moveRepository.create();
    move.boardRow = row;
    move.boardColumn = column;
    move.created = new Date();
    move.user = currentUser;
    move.game = currentGame;

    move = await this.moveRepository.save(move);

    const currentGameStatus = await this.getCurrentGameStatus(currentGame.id);
    this.updateGameStatus(currentGame, currentGameStatus);

    return move;
  }

  async getMovesInGame(currentGame: Game): Promise<MoveDto[]> {
    if (!currentGame) throw new BadRequestException('Game not found.');

    const movesInGame = await this.moveRepository.find({ game: currentGame });
    let moves: MoveDto[] = [];
    let currentPiece = currentGame.userOnePieceCode;

    for (const move of movesInGame) {
      const moveDto = new MoveDto();
      moveDto.boardRow = move.boardRow;
      moveDto.boardColumn = move.boardColumn;
      moveDto.created = move.created;
      moveDto.user = move.user;
      moveDto.game = move.game;
      moveDto.userPieceCode = currentPiece;
      moves.push(moveDto);

      currentPiece = currentPiece === PieceCode.X ? PieceCode.O : PieceCode.X;
    }

    return moves;
  }

  async getTakenMovePositionInGame(currentGame: Game): Promise<MovePosition[]> {
    if (!currentGame) throw new BadRequestException('Game not found.');

    const moves = await this.moveRepository.find({ game: currentGame });
    return moves.map(
      (move) => new MovePosition(move.boardRow, move.boardColumn),
    );
  }

  private getNumberOfUserMovesInGame(
    currentGame: Game,
    currentUser: User,
  ): Promise<number> {
    if (!currentGame) throw new BadRequestException('Game not found.');
    if (!currentUser) throw new BadRequestException('User not found.');

    return this.moveRepository.count({ game: currentGame, user: currentUser });
  }

  async isUserTurn(currentGame: Game): Promise<boolean> {
    if (!currentGame) throw new BadRequestException('Game not found.');

    const { userOne, userTwo } = currentGame;
    const userOneNumberOfMovesInGame = await this.getNumberOfUserMovesInGame(
      currentGame,
      userOne,
    );
    const userTwoNumberOfMovesInGame = await this.getNumberOfUserMovesInGame(
      currentGame,
      userTwo,
    );

    return (
      userOneNumberOfMovesInGame === userTwoNumberOfMovesInGame ||
      userOneNumberOfMovesInGame === 0
    );
  }

  async getCurrentGameStatus(id: number) {
    const currentGame = await this.gameRepository.findOne(id, {
      relations: ['userOne', 'userTwo'],
    });

    if (!currentGame) throw new BadRequestException('Game not found.');

    const userOneMoves = await this.getUserMovePositionsInGame(
      currentGame,
      currentGame.userOne,
    );
    const userTwoMoves = await this.getUserMovePositionsInGame(
      currentGame,
      currentGame.userTwo,
    );

    const filledMovePositionsInGame = await this.getTakenMovePositionInGame(
      currentGame,
    );

    if (MoveService.isWinner(userOneMoves)) return GameStatus.USER_ONE_WINS;

    if (MoveService.isWinner(userTwoMoves)) return GameStatus.USER_TWO_WINS;

    if (MoveService.isBoardFull(filledMovePositionsInGame))
      return GameStatus.DRAW;

    if (currentGame.gameType === GameType.COMPETITION && !currentGame.userTwo)
      return GameStatus.WAITS_FOR_USER;

    return GameStatus.IN_PROGRESS;
  }

  async updateGameStatus(
    currentGame: Game,
    gameStatus: GameStatus,
  ): Promise<Game> {
    if (!currentGame) throw new BadRequestException('Game not found.');

    const game = await this.gameRepository.findOne(currentGame.id);
    game.gameStatus = gameStatus;

    return game;
  }

  private static getWinningPositions(): MovePosition[][] {
    const winningPositions: MovePosition[][] = [
      [new MovePosition(1, 1), new MovePosition(2, 2), new MovePosition(3, 3)],
      [new MovePosition(1, 3), new MovePosition(2, 2), new MovePosition(3, 1)],
      [new MovePosition(1, 1), new MovePosition(1, 2), new MovePosition(1, 3)],
      [new MovePosition(2, 1), new MovePosition(2, 2), new MovePosition(2, 3)],
      [new MovePosition(3, 1), new MovePosition(3, 2), new MovePosition(3, 3)],
      [new MovePosition(1, 1), new MovePosition(2, 1), new MovePosition(3, 1)],
      [new MovePosition(1, 2), new MovePosition(2, 2), new MovePosition(3, 2)],
      [new MovePosition(1, 3), new MovePosition(2, 3), new MovePosition(3, 3)],
    ];

    return winningPositions;
  }

  private static isWinner(positions: MovePosition[]): boolean {
    const winningPosition = this.getWinningPositions().find(
      (e) => e === positions,
    );

    return winningPosition !== undefined;
  }

  private static isBoardFull(filledPositions: MovePosition[]): boolean {
    return filledPositions.length === 9;
  }

  async getUserMovePositionsInGame(
    currentGame: Game,
    currentUser: User,
  ): Promise<MovePosition[]> {
    if (!currentGame) throw new BadRequestException('Game not found.');
    if (!currentUser) throw new BadRequestException('User not found.');

    const moves = await this.moveRepository.find({
      game: currentGame,
      user: currentUser,
    });
    return moves.map(
      (move) => new MovePosition(move.boardRow, move.boardColumn),
    );
  }
}
