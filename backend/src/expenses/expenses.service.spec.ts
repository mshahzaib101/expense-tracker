import { NotFoundException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: {
    expense: {
      findFirst: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      expense: {
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new ExpensesService(prisma as unknown as PrismaService);
  });

  it('queries ownership directly when removing an expense', async () => {
    prisma.expense.findFirst.mockResolvedValue({
      id: 'expense-1',
      userId: 'user-1',
    });

    await service.remove('user-1', 'expense-1');

    expect(prisma.expense.findFirst).toHaveBeenCalledWith({
      where: { id: 'expense-1', userId: 'user-1' },
    });
    expect(prisma.expense.delete).toHaveBeenCalledWith({
      where: { id: 'expense-1' },
    });
  });

  it('returns not found when the expense is missing or not owned by the user', async () => {
    prisma.expense.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-1', 'expense-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
