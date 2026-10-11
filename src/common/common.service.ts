import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  async applyCursorPaginationParamsToQb(
    qb: SelectQueryBuilder<ObjectLiteral>,
    dto: CursorPaginationDto,
  ) {
    const { cursor, take, order } = dto;

    if (cursor) {
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
