import prisma from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
    try {
        const teamRankings = await prisma.team.findMany({
            orderBy: {
                win: 'desc', 
            },
            select: {
                name: true,
                win: true,
                lose: true,
            },
        });

        const rankingTable = teamRankings.map((team, index) => ({
            rank: index + 1,
            teamName: team.name,
            wins: team.win,
            losses: team.lose,
        }));

        return {
            statusCode: 200,
            statusMessage: 'Success',
            data: rankingTable,
        };
    } catch (error) {
        console.error('Error generating rankings:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
        });
    }
});