import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../lib/prisma';
import { getSummary } from '../summaryController';


describe('getSummary', () => {
  it('deve retornar 500 em caso de erro interno', async () => {
    // Simula erro forçando o prisma.$queryRaw a lançar
    jest.spyOn(prisma, '$queryRaw').mockImplementationOnce(() => { throw new Error('Erro simulado'); });
    const mockRequest = {} as FastifyRequest;
    const mockReply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as FastifyReply;
    await getSummary(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ message: 'Erro ao buscar resumo dos hábitos.' });
  });
});
