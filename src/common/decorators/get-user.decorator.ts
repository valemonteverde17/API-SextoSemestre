import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el usuario actual de la request
 *
 * @example
 * @Get('profile')
 * getProfile(@GetUser() user: Users) {
 *   return user;
 * }
 *
 * // Obtener solo una propiedad específica
 * @Get('my-id')
 * getMyId(@GetUser('_id') userId: string) {
 *   return userId;
 * }
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
