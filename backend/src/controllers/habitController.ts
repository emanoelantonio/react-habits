import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function createHabit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    });
    const { title, weekDays } = createHabitBody.parse(request.body);
    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(weekDay => ({ week_day: weekDay }))
        }
      }
    });
    return reply.status(201).send({ message: 'Hábito criado com sucesso.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: 'Dados inválidos.', issues: error.errors });
    }
    return reply.status(500).send({ message: 'Erro ao criar hábito.' });
  }
}

export async function toggleHabit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });
    const { id } = toggleHabitParams.parse(request.params);
    const today = dayjs().startOf('day').toDate();

    let day = await prisma.day.findUnique({ where: { date: today } });
    if (!day) {
      day = await prisma.day.create({ data: { date: today } });
    }
    const dayHabit = await prisma.dayHabit.findUnique({
      where: { day_id_habit_id: { day_id: day.id, habit_id: id } }
    });
    if (dayHabit) {
      await prisma.dayHabit.delete({ where: { id: dayHabit.id } });
      return reply.status(200).send({ message: 'Hábito desmarcado com sucesso.' });
    } else {
      await prisma.dayHabit.create({ data: { day_id: day.id, habit_id: id } });
      return reply.status(200).send({ message: 'Hábito marcado com sucesso.' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: 'ID inválido.', issues: error.errors });
    }
    return reply.status(500).send({ message: 'Erro ao alternar hábito.' });
  }
}
