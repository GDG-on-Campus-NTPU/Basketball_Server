import prisma from '~~/lib/prisma';
import { checkLogin, isVaildName } from '~~/lib/util';

export default defineEventHandler(async (event) => {
    checkLogin(event);

    const teamId = getRouterParam(event, 'teamId');
    const { name, win, lose } = await readBody(event) as {
        name?: string;
        win?: number;
        lose?: number;
    };

    if (!teamId || isNaN(parseInt(teamId))) {
        throw createError({
            statusCode: 400,
            message: 'Parameter "id" is required',
        });
    }

    const existingTeam = await prisma.team.findUnique({
        where: { id: parseInt(teamId) },
    });

    if (!existingTeam) {
        throw createError({
            statusCode: 404,
            message: `Team with ID ${teamId} does not exist`,
        });
    }

    if (name && !isVaildName(name)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid team name',
        });
    }

    const updatedTeam = await prisma.team.update({
        where: { id: parseInt(teamId) },
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
    
    return updatedTeam;
});
