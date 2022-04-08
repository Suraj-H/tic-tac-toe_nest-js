import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Move } from '../move/move.entity';
import { User } from '../user/user.entity';
import { GameStatus } from './types/game-status.enum';
import { GameType } from './types/game-type.enum';
import { PieceCode } from './types/piece-code.enum';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.games)
  userOne: User;

  @ManyToOne(() => User, (user) => user.games)
  userTwo: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endedAt: Date;

  @Column('enum', {
    enum: GameStatus,
    default: GameStatus.IN_PROGRESS,
  })
  gameStatus: GameStatus;

  @Column('enum', {
    enum: GameType,
    nullable: true,
  })
  gameType: GameType;

  @Column('enum', {
    enum: PieceCode,
    default: PieceCode.O,
  })
  userOnePieceCode: PieceCode;

  @OneToMany(() => Move, (move) => move.game)
  moves: Move[];
}
