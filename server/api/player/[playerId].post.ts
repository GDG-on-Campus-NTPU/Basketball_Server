import prisma from '~~/lib/prisma';
import { isVaildName } from '~~/lib/util';

export default defineEventHandler(async (event) => {
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

    const userId = event.context.userId;

    if (!userId) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        });
    }

    const existingPlayer = await prisma.player.findUnique({
        where: { userid: userId },
        select: { id: true }
    });

    if (existingPlayer) {
        throw createError({
            statusCode: 400,
            message: 'Player already exists for this user'
        });
    }

    const newPlayer = await prisma.player.create({
        data: {
            name,
            number,
            teamId,
            userid: userId
        },
        select: {
            id: true,
            name: true,
            number: true,
            teamId: true,
            userid: true
        }
    });

    return {
        message: 'Player created successfully',
        player: newPlayer
    };
});