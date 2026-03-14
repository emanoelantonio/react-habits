
import { FastifyInstance } from 'fastify';
import { createHabit, getDay, getSummary, toggleHabit } from './controllers';


export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', createHabit);

  app.get('/days/:date', getDay);

  app.patch('/habits/:id/toggle', toggleHabit);

  app.get('/summary', getSummary);
}

