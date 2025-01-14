import prisma from '~~/lib/prisma';
export default defineEventHandler(async (event) => {
    const { playerId } = getQuery(event) as { playerId: string | undefined };
    if (!playerId || isNaN(parseInt(playerId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "playerId" is required and should be a number.',
        });
    }

    await prisma.player.delete({
        where: { id: parseInt(playerId) },
        select: null,
    });

    setResponseStatus(event, 204);
    return null;
})