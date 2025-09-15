import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindAllUserDto {
  @ApiPropertyOptional({ example: 1, description: 'Номер страницы' })
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Количество элементов на странице' })
  limit?: number;

  @ApiPropertyOptional({ example: 'name', description: 'Поле для сортировки' })
  sort_by?: string;

  @ApiPropertyOptional({ example: 'asc', description: 'Направление сортировки' })
  sort_dir?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Фильтр по имени' })
  name?: string;

  @ApiPropertyOptional({ description: 'Фильтр по email' })
  email?: string;
}