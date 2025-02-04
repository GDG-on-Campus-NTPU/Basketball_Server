import prisma from '~~/lib/prisma';
import { isVaildName } from '~~/lib/util';

export default defineEventHandler(async (event) => {
    const { name } = await readBody(event) as {
        name: string | undefined;
    };

    if (!name) {
        throw createError({
            statusCode: 400,
            message: 'Parameter "name" is required'
        });
    }

    if (!isVaildName(name)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid team name'
        });
    }

    const existingTeam = await prisma.team.findUnique({
        where: { name },
        select: { id: true }
    });

    if (existingTeam) {
        throw createError({
            statusCode: 400,
            message: `Team with name "${name}" already exists`
        });
    }

    const newTeam = await prisma.team.upsert({
        where: {
            name: name, 
        },
        update: {},
        create: {
            name: name,
            win: 0,
            lose: 0,
        },
        select: {
            id: true,
            name: true,
            win: true,
            lose: true,
        },
    });
    

    return newTeam;
});
