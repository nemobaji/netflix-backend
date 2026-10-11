import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  order: string[] = ['id_DESC'];
  /*  
  |    order example
  |    [id_DESC, likeCount_DESC]
  */

  @IsInt()
  @IsOptional()
  take: number = 5;
}
