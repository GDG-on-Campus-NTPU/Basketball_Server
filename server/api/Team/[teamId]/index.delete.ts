import prisma from '~~/lib/prisma';
import { checkLogin } from '~~/lib/util';
export default defineEventHandler(async (event) => {
    checkLogin(event);


    const teamId = getRouterParam(event, 'teamId')
    
    if (!teamId || isNaN(parseInt(teamId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "teamId" is required and should be a number.',
        });
    }

    await prisma.team.delete({
        where: { id: parseInt(teamId) },
        select: null,
    });

    setResponseStatus(event, 204);
    return null;
})