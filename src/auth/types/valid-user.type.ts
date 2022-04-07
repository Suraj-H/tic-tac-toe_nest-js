import { Game } from '../../game/game.entity';
import { Move } from '../../move/move.entity';

export type ValidUser = {
  id: number;
  username: string;
  email: string;
  games: Game[];
  moves: Move[];
};
