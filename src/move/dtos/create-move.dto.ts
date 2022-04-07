import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMoveDto {
  @IsNotEmpty()
  @IsNumber()
  position: number;
}
