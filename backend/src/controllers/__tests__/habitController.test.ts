import { FastifyReply, FastifyRequest } from 'fastify';
import { createHabit, toggleHabit } from '../habitController';

describe('createHabit', () => {
  it('deve retornar 400 para id inválido', async () => {
    const mockRequest = { params: { id: 'id-invalido' } } as unknown as FastifyRequest;
    const mockReply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as FastifyReply;
    await toggleHabit(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({ message: 'ID inválido.' }));
  });

  it('deve retornar 400 para dados inválidos', async () => {
    const mockRequest = { body: { title: 123, weekDays: 'errado' } } as unknown as FastifyRequest;
    const mockReply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as FastifyReply;
    await createHabit(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({ message: 'Dados inválidos.' }));
  });
});
