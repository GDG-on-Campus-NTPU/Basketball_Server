import prisma from '~~/lib/prisma';
export default defineEventHandler(async (event) => {
    const teamId = getRouterParam(event, 'teamId')
    
    if (!teamId || isNaN(parseInt(teamId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "teamId" is required and should be a number.',
        });
    }

    const result = await prisma.team.findUnique({
        where: { id: parseInt(teamId) },
        select: {
            id: true,
            name: true,
            win: true,
            lose: true,
        }
    });

    if(!result){
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: `Team with ID ${teamId} does not exist.`,
        });
    }

    return result;
})