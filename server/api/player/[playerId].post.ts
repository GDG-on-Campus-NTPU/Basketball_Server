import prisma from '~~/lib/prisma';
import { isVaildName } from '~~/lib/util';

export default defineEventHandler(async (event) => {
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

    if (name && !isVaildName(name)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid name'
        });
    }

    const existingPlayer = await prisma.player.findUnique({
        where: { id },
        select: { id: true }
    });

    if (!existingPlayer) {
        throw createError({
            statusCode: 404,
            message: `Player with ID ${id} not found`
        });
    }

    if (teamId) {
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
    }

    const updatedPlayer = await prisma.player.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(number && { number }),
            ...(teamId && { teamId }),
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