import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class CreateMoveValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const position = value.position;

    if (position < 1 || position > 9)
      throw new BadRequestException('Position must be between 1 and 9.');

    return value;
  }
}
