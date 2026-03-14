import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function getDay(request: FastifyRequest, reply: FastifyReply) {
  try {
    const getDayParams = z.object({
      date: z.coerce.date()
    });
    const { date } = getDayParams.parse(request.query);
    const parseDate = dayjs(date).startOf('day');
    const weekDay = parseDate.get('day');
    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: { lte: date },
        weekDays: { some: { week_day: weekDay } }
      }
    });
    const day = await prisma.day.findUnique({
      where: { date: parseDate.toDate() },
      include: { dayHabits: true }
    });
    const completedHabits = day?.dayHabits.map(dayHabit => dayHabit.habit_id) ?? [];
    return reply.send({ possibleHabits, completedHabits });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: 'Parâmetro de data inválido.', issues: error.errors });
    }
    return reply.status(500).send({ message: 'Erro ao buscar hábitos do dia.' });
  }
}
