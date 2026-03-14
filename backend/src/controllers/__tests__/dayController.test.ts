import { FastifyReply, FastifyRequest } from 'fastify';
import { getDay } from '../dayController';

describe('getDay', () => {
  it('deve retornar 400 para parâmetro de data inválido', async () => {
    const mockRequest = { query: { date: 'data-invalida' } } as unknown as FastifyRequest;
    const mockReply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as FastifyReply;
    await getDay(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({ message: 'Parâmetro de data inválido.' }));
  });
});
