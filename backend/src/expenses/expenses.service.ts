import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  QueryExpensesDto,
  SummaryQueryDto,
} from './expenses.schemas';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        amount: new Prisma.Decimal(dto.amount),
        category: dto.category,
        date: new Date(dto.date),
        note: dto.note ?? null,
        userId,
      },
    });
    return this.serializeExpense(expense);
  }

  async findAll(userId: string, query: QueryExpensesDto) {
    const { category, startDate, endDate, page, limit, sortBy, sortOrder } =
      query;

    const where: Record<string, unknown> = { userId };

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.date = dateFilter;
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      expenses: expenses.map((expense) => this.serializeExpense(expense)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.findOwnedExpense(userId, id);

    const data: Record<string, unknown> = {};
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.note !== undefined) data.note = dto.note ?? null;

    const updated = await this.prisma.expense.update({
      where: { id: expense.id },
      data,
    });

    return this.serializeExpense(updated);
  }

  async remove(userId: string, id: string) {
    const expense = await this.findOwnedExpense(userId, id);
    await this.prisma.expense.delete({ where: { id: expense.id } });
  }

  async getSummary(userId: string, query: SummaryQueryDto) {
    const where: Record<string, unknown> = { userId };

    if (query.startDate || query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (query.startDate) dateFilter.gte = new Date(query.startDate);
      if (query.endDate) dateFilter.lte = new Date(query.endDate);
      where.date = dateFilter;
    }

    const [aggregation, byCategory] = await Promise.all([
      this.prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
      }),
    ]);

    return {
      totalAmount: aggregation._sum.amount?.toNumber() ?? 0,
      expenseCount: aggregation._count,
      byCategory: byCategory.map((group) => ({
        category: group.category,
        totalAmount: group._sum.amount?.toNumber() ?? 0,
        count: group._count,
      })),
    };
  }

  async getAllForExport(userId: string, query: SummaryQueryDto) {
    const where: Record<string, unknown> = { userId };

    if (query.startDate || query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (query.startDate) dateFilter.gte = new Date(query.startDate);
      if (query.endDate) dateFilter.lte = new Date(query.endDate);
      where.date = dateFilter;
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return expenses.map((expense) => this.serializeExpense(expense));
  }

  private async findOwnedExpense(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  private serializeExpense(expense: {
    id: string;
    amount: unknown;
    category: string;
    date: Date;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: expense.id,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date.toISOString().split('T')[0],
      note: expense.note,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  }
}
