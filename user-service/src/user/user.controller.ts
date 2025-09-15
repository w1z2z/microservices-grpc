import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, FindAllUserDto, UserResponseDto } from './dto';
import { CorrelationId } from '../grpc/decorators/correlation-id.decorator';
import { ApiKeyGuard } from './guards/api-key-auth.guard';

@UseGuards(ApiKeyGuard)
@ApiTags('Users')
@ApiSecurity('x-api-key')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан', type: UserResponseDto })
  create(@Body() createUserDto: CreateUserDto, @CorrelationId() requestId: string) {
    return this.userService.create(createUserDto, requestId);
  }

  @Get()
  @ApiOperation({ summary: 'Список пользователей с фильтрацией и пагинацией' })
  @ApiResponse({ status: 200, description: 'Список пользователей', type: UserResponseDto, isArray: true })
  findAll(@Query() query: FindAllUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь найден', type: UserResponseDto })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь обновлен', type: UserResponseDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CorrelationId() requestId: string) {
    return this.userService.update(id, updateUserDto, requestId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь удален', schema: { example: { deleted: true } } })
  remove(@Param('id') id: string, @CorrelationId() requestId: string) {
    return this.userService.remove(id, requestId);
  }
}