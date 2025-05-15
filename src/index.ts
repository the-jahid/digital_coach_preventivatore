// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { PrismaClient } from '@prisma/client';
import {z} from 'zod';
import cors from 'cors'; // Import the cors middleware

const prisma = new PrismaClient();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Use the cors middleware to allow requests from any origin
app.use(cors());

app.use(express.json());


app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from TypeScript + Express! 🚀' });
}
);

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
}
);


app.post('/api/v1/items/create', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, price } = req.body;
    // const parsed = itemSchema.parse(req.body);

    // console.log('Parsed data:', parsed);

    const newItem = await prisma.item.create({
      data: {
        name,
        price,
      },
    });

    res.status(201).json({ status: 'ok', item: newItem });
  } catch (err) {
    next(err); // passa l'errore al globalErrorHandler
  }
});

// GET ALL ITEMS
app.get('/api/v1/items', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await prisma.item.findMany();
    res.status(200).json({ status: 'ok', items });
  } catch (err) {
    next(err);
  }
});

// GET ITEM BY ID
app.get('/api/v1/items/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
       res.status(404).json({ status: 'error', message: 'Item not found' });
    }

    res.status(200).json({ status: 'ok', item });
  } catch (err) {
    next(err);
  }
});

// UPDATE ITEM BY ID
app.put('/api/v1/items/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { name, price } = req.body;

    const updatedItem = await prisma.item.update({
      where: { id },
      data: { name, price },
    });

    res.status(200).json({ status: 'ok', item: updatedItem });
  } catch (err) {
    next(err);
  }
});

// DELETE ITEM BY ID
app.delete('/api/v1/items/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    await prisma.item.delete({
      where: { id },
    });

    res.status(200).json({ status: 'ok', message: `Item ${id} deleted` });
  } catch (err) {
    next(err);
  }
});

app.use(globalErrorHandler);

/* ──── Start the server ───────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`⚡️ Server ready at http://localhost:${PORT}`);
});




