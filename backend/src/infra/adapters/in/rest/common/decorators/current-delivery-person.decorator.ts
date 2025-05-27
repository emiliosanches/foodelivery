import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentDeliveryPerson = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().deliveryPerson;
  },
);
