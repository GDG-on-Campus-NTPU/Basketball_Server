import prisma from '~~/lib/prisma';
import { checkAdmin, checkLogin } from '~~/lib/util';
export default defineEventHandler(async (event) => {
    checkLogin(event);

    const playerIdStr = getRouterParam(event, 'playerId')

    if (!playerIdStr || isNaN(parseInt(playerIdStr))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "playerId" is required and should be a number.',
        });
    }

    const playerId = parseInt(playerIdStr);

    if (playerId !== event.context.userId) {
        checkAdmin(event);
    }

    await prisma.player.delete({
        where: { id: playerId },
        select: null,
    });

    setResponseStatus(event, 204);
    return null;
})