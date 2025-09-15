import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'Vitaly', description: 'Имя пользователя' })
    name: string;

    @ApiProperty({ example: 'vitaly@example.com', description: 'Email пользователя' })
    email: string;
}