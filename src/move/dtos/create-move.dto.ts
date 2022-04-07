import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMoveDto {
  @IsNotEmpty()
  @IsNumber()
  readonly row: number;

  @IsNotEmpty()
  @IsNumber()
  readonly column: number;
}
