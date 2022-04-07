import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (!currentGame) throw new NotFoundException('Game not found.');
    if (!currentUser) throw new NotFoundException('User not found.');

    const { position } = createMoveDto;

    let move = this.moveRepository.create();
    move.position = position;
    move.created = new Date();
    move.user = currentUser;
    move.game = currentGame;

    move = await this.moveRepository.save(move);

    const currentGameStatus = await this.getCurrentGameStatus(currentGame.id);
    this.updateGameStatus(currentGame, currentGameStatus);
    move.game.gameStatus = currentGameStatus;

    return move;
  }

  async getCurrentGameStatus(id: number) {
    const currentGame = await this.gameRepository.findOne(id, {
      relations: ['userOne', 'userTwo'],
    });

    if (!currentGame) throw new NotFoundException('Game not found.');

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

    if (userOneMoves.length > 2 && this.isWinner(userOneMoves))
      return GameStatus.USER_ONE_WINS;

    if (userTwoMoves.length > 2 && this.isWinner(userTwoMoves))
      return GameStatus.USER_TWO_WINS;

    if (this.isBoardFull(filledMovePositionsInGame)) return GameStatus.DRAW;

    if (currentGame.gameType === GameType.COMPETITION && !currentGame.userTwo)
      return GameStatus.WAITS_FOR_USER;

    return GameStatus.IN_PROGRESS;
  }

  /**
   * Stores list of winning positions.
   * @return the list of the winning position's indexes.
   */
  private getWinningPositions(): number[][] {
    const winningPositions: number[][] = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [3, 5, 7],
    ];

    return winningPositions;
  }

  /**
   * Checks if the user wins the game
   * @param positions - Positions of user moves retrieved from database
   * @return true or false depending on the user is a winner
   */
  private isWinner(positions: number[]): boolean {
    let winningPosition = this.getWinningPositions();

    for (let i = 0; i < winningPosition.length; i++) {
      const [a, b, c] = winningPosition[i];
      if (
        positions.includes(a) &&
        positions.includes(b) &&
        positions.includes(c)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * To check if move is valid by compairing with the moves in the list
   * @param currentGame currently running game from session
   * @returns list of all moves played in the game
   */
  async getMovesInGame(currentGame: Game): Promise<MoveDto[]> {
    if (!currentGame) throw new NotFoundException('Game not found.');

    const movesInGame = await this.moveRepository.find({ game: currentGame });
    let moves: MoveDto[] = [];
    let currentPiece = currentGame.userOnePieceCode;

    for (const move of movesInGame) {
      const moveDto = new MoveDto();
      moveDto.position = move.position;
      moveDto.created = move.created;
      moveDto.user = move.user;
      moveDto.game = move.game;
      moveDto.userPieceCode = currentPiece;
      moves.push(moveDto);

      currentPiece = currentPiece === PieceCode.X ? PieceCode.O : PieceCode.X;
    }

    return moves;
  }

  async getTakenMovePositionInGame(currentGame: Game): Promise<number[]> {
    if (!currentGame) throw new NotFoundException('Game not found.');

    const moves = await this.moveRepository.find({ game: currentGame });
    return moves.map((move) => move.position);
  }

  private getNumberOfUserMovesInGame(
    currentGame: Game,
    currentUser: User,
  ): Promise<number> {
    if (!currentGame) throw new NotFoundException('Game not found.');
    if (!currentUser) throw new NotFoundException('User not found.');

    return this.moveRepository.count({ game: currentGame, user: currentUser });
  }

  /**
   * @return true or false depending on the count of the user's moves
   */
  async isUserTurn(currentGame: Game): Promise<boolean> {
    if (!currentGame) throw new NotFoundException('Game not found.');

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

  async updateGameStatus(
    currentGame: Game,
    gameStatus: GameStatus,
  ): Promise<Game> {
    if (!currentGame) throw new NotFoundException('Game not found.');

    const game = await this.gameRepository.findOne(currentGame.id);
    game.gameStatus = gameStatus;
    return this.gameRepository.save(game);
  }

  private isBoardFull(filledPositions: number[]): boolean {
    return filledPositions.length === 9;
  }

  async getUserMovePositionsInGame(
    currentGame: Game,
    currentUser: User,
  ): Promise<number[]> {
    if (!currentGame) throw new NotFoundException('Game not found.');
    if (!currentUser) throw new NotFoundException('User not found.');

    const moves = await this.moveRepository.find({
      game: currentGame,
      user: currentUser,
    });
    return moves.map((move) => move.position);
  }
}
