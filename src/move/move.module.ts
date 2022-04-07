import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../game/game.entity';
import { MoveController } from './move.controller';
import { Move } from './move.entity';
import { MoveService } from './move.service';

@Module({
  imports: [TypeOrmModule.forFeature([Move, Game])],
  controllers: [MoveController],
  providers: [MoveService],
})
export class MoveModule {}
