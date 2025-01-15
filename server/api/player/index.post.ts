import prisma from '~~/lib/prisma';
import { checkLogin, isVaildName } from '~~/lib/util';

export default defineEventHandler(async (event) => {
    checkLogin(event);


    const { id, name, number, teamId } = await readBody(event) as {
        id: number | undefined;
        name: string | undefined;
        number: number | undefined;
        teamId: number | undefined;
    };

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Parameter "id" is required'
        });
    }

    if (!name || !isVaildName(name)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid name'
        });
    }

    if (!number) {
        throw createError({
            statusCode: 400,
            message: 'Parameter "number" is required'
        });
    }

    const existingPlayer = await prisma.player.findUnique({
        where: { id },
        select: { id: true }
    });

    if (existingPlayer) {
        throw createError({
            statusCode: 404,
            message: `Player with ID ${id} already exists`
        });
    }

    if (!teamId) {
        throw createError({
            statusCode: 400,
            message: 'Parameter "teamId" is required'
        });
    }

    const teamExists = await prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true }
    });

    if (!teamExists) {
        throw createError({
            statusCode: 404,
            message: `Team with ID ${teamId} not found`
        });
    }

    const updatedPlayer = await prisma.player.create({
        data: {
            id,
            name,
            number,
            teamId,
        },
        select: {
            id: true,
            name: true,
            number: true,
            teamId: true,
        },
    });

    return {
        message: 'Player updated successfully',
        player: updatedPlayer,
    };
});