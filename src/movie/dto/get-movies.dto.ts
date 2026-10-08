import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetMoviesDto extends PaginationDto {
  @IsString()
  @IsOptional()
  title?: string;
}
