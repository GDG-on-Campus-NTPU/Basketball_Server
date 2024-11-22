import prisma from '~~/lib/prisma';
import * as XLSX from 'xlsx';

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '未接收到文件' });
  }

  const file = formData[0].data;
  const workbook = XLSX.read(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const table: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const failEntries: {
    row: number;
    reason: string;
  }[] = [];

  const playerToContestData: {
    playerId: number;
    contestId: number;
  }[] = [];

  const performanceData: any[] = [];

  const row = table[0];
  const teamname = row[1];
  const opposingTeam = row[3];
  const winTeam = row[5];
  const date = row[7];

  if (!date || !teamname || !opposingTeam || !winTeam) {
    failEntries.push({
      row: 0,
      reason: 'Missing required fields.',
    });
  }

  let contest = await prisma.contest.findFirst({
    where: {
      teamname,
      opposingTeam,
      date: parseInt(date),
    },
  });

  if (!contest) {
    contest = await prisma.contest.create({
      data: {
        teamname,
        opposingTeam,
        winTeam,
        date: parseInt(date),
      }
    })
  }

  const team = await prisma.team.findFirst({
    where: { name: teamname },
  });

  let players: { id: number; name: string }[] = [];

  if (!team) {
    failEntries.push({
      row: 0,
      reason: `Team ${teamname} not found.`,
    });
  }
  else {
    const players = await prisma.player.findMany({
      where: { teamId: team.id },
    });
  }

  players.forEach((player) => {
    playerToContestData.push({
      playerId: player.id,
      contestId: contest!.id,
    });
  });

  await prisma.player_to_contest.createMany({
    data: playerToContestData,
  });

  const playerMap = new Map(players.map((player) => [player.name, player.id]));

  for (let i = 1; i < table.length; i++) {
    const row = table[i];
    const starting = row[0];
    const playerName = row[2];
    const two_point_made = row[3];
    const two_point_missed = row[4];
    const three_point_made = row[5];
    const three_point_missed = row[6];
    const free_throw_made = row[7];
    const free_throw_missed = row[8];
    const rebound_offensive = row[9];
    const rebound_defensive = row[10];
    const block = row[11];
    const steal = row[12];
    const assist = row[13];
    const foul = row[14];
    const mistake = row[15];
    const score = row[16];

    if (
      !playerName ||
      !two_point_made ||
      !two_point_missed ||
      !three_point_made ||
      !three_point_missed ||
      !free_throw_made ||
      !free_throw_missed ||
      !rebound_offensive ||
      !rebound_defensive ||
      !block ||
      !steal ||
      !assist ||
      !foul ||
      !mistake ||
      !score
    ) {
      failEntries.push({
        row: i,
        reason: 'Missing required fields.',
      });
      continue;
    }

    const playerId = playerMap.get(playerName);
    if (!playerId) {
      failEntries.push({
        row: i,
        reason: `Player ${playerName} not found in team ${teamname}.`,
      });
      continue;
    }

    performanceData.push({
      starting: Boolean(starting),
      playerId: playerId,
      two_point_made: parseInt(two_point_made),
      two_point_missed: parseInt(two_point_missed),
      three_point_made: parseInt(three_point_made),
      three_point_missed: parseInt(three_point_missed),
      free_throw_made: parseInt(free_throw_made),
      free_throw_missed: parseInt(free_throw_missed),
      rebound_offensive: parseInt(rebound_offensive),
      rebound_defensive: parseInt(rebound_defensive),
      block: parseInt(block),
      steal: parseInt(steal),
      assist: parseInt(assist),
      foul: parseInt(foul),
      mistake: parseInt(mistake),
      score: parseInt(score),
    });

    playerToContestData.push({
      playerId: playerId,
      contestId: contest.id,
    });
  }

  const createdPerformances = await prisma.performance.createMany({
    data: performanceData,
  });

setResponseStatus(event, 200);
return {
  failEntries,
  message: 'Upload successful.',
};
});