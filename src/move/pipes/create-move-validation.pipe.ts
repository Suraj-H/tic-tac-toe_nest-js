import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class CreateMoveValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const row = value.row;
    const column = value.column;

    if (row < 1 || row > 3) {
      throw new BadRequestException('Row must be between 1 and 3');
    }

    if (column < 1 || column > 3) {
      throw new BadRequestException('Column must be between 1 and 3');
    }

    return value;
  }
}
