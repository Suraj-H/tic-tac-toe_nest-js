import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Move } from '../move/move.entity';
import { User } from '../user/user.entity';
import { GameController } from './game.controller';
import { Game } from './game.entity';
import { GameService } from './game.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, Move])],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
