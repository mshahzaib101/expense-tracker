import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExpensesService } from './expenses.service';
import {
  createExpenseSchema,
  updateExpenseSchema,
  queryExpensesSchema,
  summaryQuerySchema,
} from './expenses.schemas';
import type {
  CreateExpenseDto,
  UpdateExpenseDto,
  QueryExpensesDto,
  SummaryQueryDto,
} from './expenses.schemas';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

function csvSafe(value: string): string {
  const escaped = value.replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(escaped)) {
    return `"'${escaped}"`;
  }
  if (/[",\r\n]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(createExpenseSchema)) body: CreateExpenseDto,
  ) {
    const expense = await this.expensesService.create(user.id, body);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Expense created',
      data: { expense },
    };
  }

  @Get('export')
  async exportCsv(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(summaryQuerySchema)) query: SummaryQueryDto,
    @Res() res: Response,
  ) {
    const expenses = await this.expensesService.getAllForExport(user.id, query);

    const header = 'Date,Category,Amount,Note';
    const rows = expenses.map((e) => {
      const date = csvSafe(e.date);
      const category = csvSafe(e.category);
      const amount = String(e.amount);
      const note = csvSafe(e.note ?? '');
      return `${date},${category},${amount},${note}`;
    });

    const csv = [header, ...rows].join('\r\n');
    const filename = `expenses-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('summary')
  async summary(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(summaryQuerySchema)) query: SummaryQueryDto,
  ) {
    const data = await this.expensesService.getSummary(user.id, query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data,
    };
  }

  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(queryExpensesSchema)) query: QueryExpensesDto,
  ) {
    const data = await this.expensesService.findAll(user.id, query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data,
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExpenseSchema)) body: UpdateExpenseDto,
  ) {
    const expense = await this.expensesService.update(user.id, id, body);
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense updated',
      data: { expense },
    };
  }

  @Delete(':id')
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.expensesService.remove(user.id, id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense deleted',
      data: null,
    };
  }
}
