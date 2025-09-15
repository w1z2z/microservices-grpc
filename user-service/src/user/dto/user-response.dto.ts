import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '1', description: 'ID пользователя' })
  id: string;

  @ApiProperty({ example: 'Vitaly', description: 'Имя пользователя' })
  name: string;

  @ApiProperty({ example: 'vitaly@example.com', description: 'Email пользователя' })
  email: string;

  @ApiProperty({ example: '2025-09-15T19:32:00Z', description: 'Дата создания' })
  createdAt: string;

  @ApiProperty({ example: '2025-09-15T19:32:00Z', description: 'Дата последнего обновления' })
  updatedAt: string;
}