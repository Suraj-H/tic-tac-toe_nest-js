import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentGame = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.game ?? null;
  },
);
