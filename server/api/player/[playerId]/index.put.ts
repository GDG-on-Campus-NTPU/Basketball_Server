import prisma from '~~/lib/prisma';
import { checkAdmin, checkLogin, isVaildName } from '~~/lib/util';

export default defineEventHandler(async (event) => {
    checkLogin(event);

    const { name, number, teamId } = await readBody(event) as {
        name: string | undefined;
        number: number | undefined;
        teamId: number | undefined;
    };

    if (name == undefined || number == undefined || teamId == undefined) {
        throw createError({
            statusCode: 400,
            message: 'Parameters name, number, and teamId are required'
        });
    }

    if (isVaildName(name) == false) {
        throw createError({
            statusCode: 400,
            message: 'Invalid name'
        });
    }

    const teamExists = await prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true }
    });

    if (!teamExists) {
        throw createError({
            statusCode: 404,
            message: `Team ${teamId} not found`
        });
    }

    const idStr = getRouterParam(event, 'playerId');

    if (!idStr || isNaN(parseInt(idStr))) {
        throw createError({
            statusCode: 400,
            message: 'Parameter "id" is required'
        });
    }

    const id = parseInt(idStr);

    if (id !== event.context.userId) {
        checkAdmin(event);
    }


    const newPlayer = await prisma.player.update({
        where: {
            id
        },
        data: {
            name,
            number,
            teamId
        },
        select: {
            id: true,
            name: true,
            number: true,
            teamId: true,
        },
    });
    
    return newPlayer;
});