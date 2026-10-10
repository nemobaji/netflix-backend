import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @IsInt()
  @IsOptional()
  cursor?: string;
  /*  
  |   cursor example
  |   id_50
  |   likeCount_20
  */

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  order: string[] = [];
  /*  
  |    order example
  |    [id_DESC, likeCount_ASC]
  */

  @IsInt()
  @IsOptional()
  take: number = 5;
}
