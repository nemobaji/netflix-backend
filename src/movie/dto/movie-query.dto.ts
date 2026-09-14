import { IsOptional, IsString, MinLength } from 'class-validator';

export class MovieQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '검색어는 2글자 이상이어야 합니다.' })
  title?: string;
}
