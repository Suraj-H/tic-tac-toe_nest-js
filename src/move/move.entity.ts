import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from '../game/game.entity';
import { User } from '../user/user.entity';

@Entity()
export class Move {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.moves)
  user: User;

  @ManyToOne(() => Game, (game) => game.moves)
  game: Game;

  @Column()
  position: number;

  @Column({ type: 'timestamp', nullable: true })
  created: Date;
}
