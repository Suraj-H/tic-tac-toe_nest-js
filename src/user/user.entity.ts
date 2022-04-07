import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from '../game/game.entity';
import { Move } from '../move/move.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  username: string;

  @Column('varchar', { length: 100 })
  email: string;

  @Exclude()
  @Column('varchar', { length: 100 })
  password: string;

  games: Game[];

  @OneToMany(() => Move, (move) => move.user)
  moves: Move[];
}
