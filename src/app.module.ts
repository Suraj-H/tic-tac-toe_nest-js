import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from '../ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { MoveModule } from './move/move.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    GameModule,
    MoveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
