
import { FastifyInstance } from 'fastify';


export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (request, reply) => {
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
            create: weekDays.map(weekDay => {
              return {
                week_day: weekDay,
              };
            })
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
  });

  app.get('/day', async (request, reply) => {
    try {
      const getDayParams = z.object({
        date: z.coerce.date()
      });

      const { date } = getDayParams.parse(request.query);
      const parseDate = dayjs(date).startOf('day');
      const weekDay = parseDate.get('day');

      const possibleHabits = await prisma.habit.findMany({
        where: {
          created_at: {
            lte: date,
          },
          weekDays: {
            some: {
              week_day: weekDay,
            }
          }
        }
      });

      const day = await prisma.day.findUnique({
        where: {
          date: parseDate.toDate(),
        },
        include: {
          dayHabits: true,
        }
      });
      const completedHabits = day?.dayHabits.map(dayHabit => {
        return dayHabit.habit_id;
      }) ?? [];

      return reply.send({
        possibleHabits,
        completedHabits,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetro de data inválido.', issues: error.errors });
      }
      return reply.status(500).send({ message: 'Erro ao buscar hábitos do dia.' });
    }
  });

  app.patch('/habits/:id/toggle', async (request, reply) => {
    try {
      const toggleHabitParams = z.object({
        id: z.string().uuid(),
      });

      const { id } = toggleHabitParams.parse(request.params);
      const today = dayjs().startOf('day').toDate();

      let day = await prisma.day.findUnique({
        where: {
          date: today,
        }
      });

      if (!day) {
        day = await prisma.day.create({
          data: {
            date: today,
          }
        });
      }

      const dayHabit = await prisma.dayHabit.findUnique({
        where: {
          day_id_habit_id: {
            day_id: day.id,
            habit_id: id,
          }
        }
      });

      if (dayHabit) {
        await prisma.dayHabit.delete({
          where: {
            id: dayHabit.id,
          }
        });
        return reply.status(200).send({ message: 'Hábito desmarcado com sucesso.' });
      } else {
        await prisma.dayHabit.create({
          data: {
            day_id: day.id,
            habit_id: id,
          }
        });
        return reply.status(200).send({ message: 'Hábito marcado com sucesso.' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'ID inválido.', issues: error.errors });
      }
      return reply.status(500).send({ message: 'Erro ao alternar hábito.' });
    }
  });

  app.get('/summary', async (request, reply) => {
    try {
      const summary = await prisma.$queryRaw`
        SELECT D.id, D.date,
        (
          SELECT cast(count(*)as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT cast(count(*)as float)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch')as int)
          AND H.created_at <= D.date
        ) as amount
        FROM days D
      `;
      return reply.send(summary);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao buscar resumo dos hábitos.' });
    }
  });
}
