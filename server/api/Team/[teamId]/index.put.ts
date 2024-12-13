import prisma from '~~/lib/prisma';
import { isVaildName } from '~~/lib/util';

export default defineEventHandler(async (event) => {
    const { id, name, win, lose } = await readBody(event) as {
        id: number;
        name?: string;
        win?: number;
        lose?: number;
    };

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Parameter "id" is required',
        });
    }

    const existingTeam = await prisma.team.findUnique({
        where: { id },
    });

    if (!existingTeam) {
        throw createError({
            statusCode: 404,
            message: `Team with ID ${id} does not exist`,
        });
    }

    if (name && !isVaildName(name)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid team name',
        });
    }

    const updatedTeam = await prisma.team.update({
        where: { id },
        data: {
            ...(name ? { name } : {}), 
            ...(win !== undefined ? { win } : {}), 
            ...(lose !== undefined ? { lose } : {}),
        },
        select: {
            id: true,
            name: true,
            win: true,
            lose: true,
        },
    });
    
    return {
        message: 'Team updated successfully',
        team: updatedTeam,
    };
});
