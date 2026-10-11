import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  async applyCursorPaginationParamsToQb(
    qb: SelectQueryBuilder<ObjectLiteral>,
    dto: CursorPaginationDto,
  ) {
    let { cursor, take, order } = dto;

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
      const cursorObject = JSON.parse(decodedCursor);
      /* return value before base64 encoding
       *
       * {
       *    values: { id: 27 },
       *    order: ['id_DESC', 'likeCount_ASC']
       * }
       *
       */
      const { values } = cursorObject;
      order = cursorObject.order;
      const columns = Object.keys(values);
      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>';
      const whereConditions = columns.map((c) => `${qb.alias}.${c}`).join(',');
      const whereParams = columns.map((c) => `:${c}`).join(',');

      qb.where(
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`,
        values,
      );
    }

    for (let i = 0; i < order.length; i++) {
      const [column, direction] = order[i].split('_');
      if (i === 0) {
        qb.orderBy(`${qb.alias}.${column}`, direction as 'ASC' | 'DESC');
      } else {
        qb.addOrderBy(`${qb.alias}.${column}`, direction as 'ASC' | 'DESC');
      }
    }

    qb.take(take);

    const results = await qb.getMany();
    const nextCursor = this.generateNextCursor(results, order);
    return nextCursor;
  }

  generateNextCursor(results: ObjectLiteral[], order: string[]): string | null {
    /* return value before base64 encoding
     *
     * {
     *    values: { id: 27 },
     *    order: ['id_DESC', 'likeCount_ASC']
     * }
     *
     */
    if (results.length === 0) return null;

    const lastItem = results[results.length - 1] as Record<string, any>;
    const values: Record<string, number> = {};

    order.forEach((columnOrder) => {
      const [column] = columnOrder.split('_');
      values[column] = lastItem[column];
    });

    const cursorObject = { values, order };
    const nextCursor = Buffer.from(JSON.stringify(cursorObject)).toString(
      'base64',
    );

    return nextCursor;
  }
}
