import { PrismaClient } from '@prisma/client';
import { JsonArray } from '@prisma/client/runtime/library';
const prisma = new PrismaClient();

const ACTION_PER_TURN = 1000000;

export const getGameInfo = async (req: any, res: any) => {
  const teamId = parseInt(req.params.team, 10);

  try {
    const gameSession = await prisma.gameSession.findFirst({
      orderBy: { gameTurn: 'desc' },
    });

    if (!gameSession) {
      return res.status(404).json({ message: 'No game session found' });
    }

    const { gameTurn } = gameSession;

    const actionsUsed = await prisma.history.count({
      where: {
        user: { teamId },
        gameTurn,
      },
    });

    const remainingActions = ACTION_PER_TURN - actionsUsed;

    res.json({
      gameSession,
      remainingActions: Math.max(0, remainingActions),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const reinforcement = async (req: any, res: any) => {
  const teamId = parseInt(req.params.team, 10);
  const { cellId, units } = req.body;

  if (cellId === null || !units || units <= 0) {
    return res
      .status(400)
      .json({ message: 'Invalid cellId or units provided' });
  }

  try {
    const gameSession = await prisma.gameSession.findFirst({
      orderBy: { gameTurn: 'desc' },
    });

    if (!gameSession) {
      return res.status(404).json({ message: 'No game session found' });
    }

    const { gameTurn, board } = gameSession as {
      gameTurn: number;
      board: JsonArray;
    };

    if (!board) {
      return res.status(404).json({ message: 'No game session found' });
    }
    // Vérifier les actions restantes
    const actionsUsed = await prisma.history.count({
      where: {
        user: { teamId },
        gameTurn,
      },
    });

    const remainingActions = ACTION_PER_TURN - actionsUsed;
    if (remainingActions <= 0) {
      return res
        .status(400)
        .json({ message: 'Not enough actions remaining for this turn' });
    }

    // Trouver la cellule cible et vérifier qu'elle appartient à l'équipe
    const targetCell: any = board.find((cell: any) => cell.id === cellId);

    if (!targetCell || targetCell.team_id !== teamId) {
      return res.status(400).json({
        message: 'Cell does not belong to the team or does not exist',
      });
    }

    // Transaction pour mettre à jour le board et ajouter une ligne à l'historique
    const updatedGameSession = await prisma.$transaction(async (tx) => {
      // Mettre à jour la cellule
      const updatedBoard = board.map((cell: any) =>
        cell.id === cellId
          ? { ...cell, units: parseInt(cell.units) + parseInt(units) }
          : cell
      );

      await tx.gameSession.update({
        where: { id: gameSession.id },
        data: { board: updatedBoard },
      });

      // Ajouter une entrée à l'historique
      const user = await tx.user.findFirst({
        where: { teamId },
      });

      if (!user) {
        throw new Error('No user found for the team');
      }

      await tx.history.create({
        data: {
          userId: user.id,
          gameAction: 'REINFORCEMENT',
          gameTurn,
        },
      });

      return tx.gameSession.findFirst({
        where: { id: gameSession.id },
      });
    });

    res.json(updatedGameSession);
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

export const move = async (req: any, res: any) => {
  const teamId = parseInt(req.params.team, 10);
  const { cellFromId, cellToId } = req.body;

  if (cellFromId === null || cellToId === null) {
    return res
      .status(400)
      .json({ message: 'Invalid cellFromId or cellToId provided' });
  }

  try {
    const gameSession = await prisma.gameSession.findFirst({
      orderBy: { gameTurn: 'desc' },
    });

    if (!gameSession) {
      return res.status(404).json({ message: 'No game session found' });
    }

    const { gameTurn, board } = gameSession as {
      gameTurn: number;
      board: JsonArray;
    };
    // Vérifier les actions restantes
    const actionsUsed = await prisma.history.count({
      where: {
        user: { teamId },
        gameTurn,
      },
    });

    const remainingActions = ACTION_PER_TURN - actionsUsed;
    if (remainingActions <= 0) {
      return res
        .status(400)
        .json({ message: 'Not enough actions remaining for this turn' });
    }

    // Récupérer les cellules concernées
    const cellFrom: any = board.find((cell: any) => cell.id === cellFromId);
    const cellTo: any = board.find((cell: any) => cell.id === cellToId);

    if (!cellFrom || !cellTo) {
      return res.status(400).json({ message: 'Invalid cell IDs provided' });
    }

    // Vérifications des règles
    if (cellFrom.team_id !== teamId) {
      return res
        .status(400)
        .json({ message: 'cellFrom does not belong to the team' });
    }

    if (cellFrom.units <= 0) {
      return res.status(400).json({ message: 'cellFrom has no units to move' });
    }

    if (cellFrom.units < 1) {
      return res
        .status(400)
        .json({ message: 'Insufficient units in cellFrom' });
    }

    const isAdjacent =
      Math.abs(cellFrom.coordinates.x - cellTo.coordinates.x) <= 1 &&
      Math.abs(cellFrom.coordinates.y - cellTo.coordinates.y) <= 1;

    if (!isAdjacent) {
      return res
        .status(400)
        .json({ message: 'cellTo is not adjacent to cellFrom' });
    }

    // Logique de déplacement
    const updatedBoard = [...board];

    if (cellTo.team_id === 1) {
      // CellTo appartient à l'équipe 1 : elle devient une cellule de l'équipe en jeu
      cellTo.team_id = teamId;
      cellTo.units = cellFrom.units;
      cellFrom.units = 0;
    } else if (cellTo.team_id === teamId) {
      // CellTo appartient à la même équipe : fusion des unités
      cellTo.units += cellFrom.units;
      cellFrom.units = 0;
    } else {
      // CellTo appartient à une autre équipe : combat
      if (cellTo.units === cellFrom.units) {
        // Status quo : rien ne change
      } else if (cellTo.units > cellFrom.units) {
        // Défenseur gagne : l'attaquant perd la moitié de ses unités
        cellFrom.units = Math.floor(cellFrom.units / 2);
      } else {
        // Attaquant gagne : CellTo change d'équipe et prend la différence d'unités
        cellTo.team_id = teamId;
        cellTo.units = parseInt(cellFrom.units) - parseInt(cellTo.units);
        cellFrom.units = 0;
      }
    }

    // Mise à jour de la GameSession et ajout à l'historique dans une transaction
    const updatedGameSession = await prisma.$transaction(async (tx) => {
      await tx.gameSession.update({
        where: { id: gameSession.id },
        data: { board: updatedBoard },
      });

      const user = await tx.user.findFirst({
        where: { teamId },
      });

      if (!user) {
        throw new Error('No user found for the team');
      }

      await tx.history.create({
        data: {
          userId: user.id,
          gameAction: 'MOVE',
          gameTurn,
        },
      });

      return tx.gameSession.findFirst({
        where: { id: gameSession.id },
      });
    });

    res.json(updatedGameSession);
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

export const getCloseCell = async (req: any, res: any) => {
  const cellId = parseInt(req.params.cellId, 10);

  if (!cellId) {
    return res.status(400).json({ message: 'Invalid cellId provided' });
  }

  try {
    const gameSession = await prisma.gameSession.findFirst({
      orderBy: { gameTurn: 'desc' },
    });

    if (!gameSession) {
      return res.status(404).json({ message: 'No game session found' });
    }

    const { board }: any = gameSession;

    const cell = board.find((c: any) => c.id === cellId);

    if (!cell) {
      return res.status(400).json({ message: 'Cell not found in the board' });
    }

    const adjacentCells = board.filter((c: any) => {
      const isAdjacent =
        (c.coordinates.x === cell.coordinates.x &&
          Math.abs(c.coordinates.y - cell.coordinates.y) === 1) || // Même ligne, colonne adjacente
        (c.coordinates.y === cell.coordinates.y &&
          Math.abs(c.coordinates.x - cell.coordinates.x) === 1); // Même colonne, ligne adjacente
      return isAdjacent;
    });

    const adjacentCellIds = adjacentCells.map((c: any) => c.id);

    res.json({ adjacentCellIds });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};
