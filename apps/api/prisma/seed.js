const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const MAX_ROW = 40;
const MAX_COL = 40;

async function main() {
  // Teams
  await prisma.team.createMany({
    data: [
      { id: 1, color: 'grey', name: 'asteroid', totalUnits: 0 },
      { id: 2, color: 'red', name: 'donuts', totalUnits: 1000 },
      { id: 3, color: 'green', name: 'ducks', totalUnits: 1000 },
      { id: 4, color: 'blue', name: 'schizo', totalUnits: 1000 },
      { id: 5, color: 'yellow', name: 'racoon', totalUnits: 1000 },
    ],
  });

  // Users
  await prisma.user.createMany({
    data: [
      { id: 1, teamId: 2, email: 'dduval1@eleven-las.com', password: 'toto' },
      { id: 2, teamId: 3, email: 'dduval2@eleven-las.com', password: 'toto' },
      { id: 3, teamId: 4, email: 'dduval3@eleven-las.com', password: 'toto' },
      { id: 4, teamId: 5, email: 'dduval4@eleven-las.com', password: 'toto' },
    ],
  });

  const teamForBoard = (row, col) => {
    if (row === 0 && col === 0) {
      return 2;
    }

    if (row === 0 && col === MAX_COL - 1) {
      return 3;
    }

    if (row === MAX_ROW - 1 && col === 0) {
      return 4;
    }

    if (row === MAX_ROW - 1 && col == MAX_COL - 1) {
      return 5;
    }

    return 1;
  };

  // GameSession
  const board = Array.from({ length: MAX_ROW }, (_, row) =>
    Array.from({ length: MAX_COL }, (_, col) => ({
      id: row * MAX_COL + col + 1,
      coordinates: { x: row, y: col },
      team_id: teamForBoard(row, col),
      units: 0,
    }))
  ).flat();

  await prisma.gameSession.create({
    data: {
      gameTurn: 1,
      board,
    },
  });

  console.log('Database has been seeded.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
