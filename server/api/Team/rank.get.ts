import prisma from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
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
});