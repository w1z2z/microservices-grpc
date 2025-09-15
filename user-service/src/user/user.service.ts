import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../models/user.model';
import { CreateUserDto, UpdateUserDto, FindAllUserDto, UserResponseDto } from './dto';
import { GrpcService } from '../grpc/grpc.service';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly grpcService: GrpcService,
  ) {}

  private toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async create(createUserDto: CreateUserDto, requestId?: string): Promise<UserResponseDto> {
    const existingUser = await this.userModel.findOne({ where: { email: createUserDto.email }, paranoid: false });
    if (existingUser) {
      throw new BadRequestException(existingUser.deletedAt
        ? `Пользователь с email ${createUserDto.email} ранее был удалён`
        : `Пользователь с email ${createUserDto.email} уже существует`);
    }

    const user = await this.userModel.create(createUserDto);

    await this.grpcService.sendAudit({
      action: 'user_created',
      entity_type: 1,
      entity_id: user.id,
      request_id: requestId || uuidv4(),
      timestamp: new Date().toISOString(),
    });

    return this.toDto(user);
  }

  async findAll(query: FindAllUserDto): Promise<{ count: number; rows: UserResponseDto[] }> {
    const { page = 1, limit = 10, sort_by = 'createdAt', sort_dir = 'desc', name, email } = query;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };

    const result = await this.userModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sort_by, sort_dir.toUpperCase()]],
    });

    return {
      count: result.count,
      rows: result.rows.map(this.toDto),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new HttpException(`Пользователь ${id} не найден`, HttpStatus.NOT_FOUND);
    return this.toDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, requestId?: string): Promise<UserResponseDto> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new HttpException(`Пользователь ${id} не найден`, HttpStatus.NOT_FOUND);

    await user.update(updateUserDto);

    await this.grpcService.sendAudit({
      action: 'user_updated',
      entity_type: 1,
      entity_id: user.id,
      request_id: requestId || uuidv4(),
      timestamp: new Date().toISOString(),
    });

    return this.toDto(user);
  }

  async remove(id: string, requestId?: string): Promise<{ deleted: boolean }> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new HttpException(`Пользователь ${id} не найден`, HttpStatus.NOT_FOUND);

    await user.destroy();

    await this.grpcService.sendAudit({
      action: 'user_deleted',
      entity_type: 1,
      entity_id: user.id,
      request_id: requestId || uuidv4(),
      timestamp: new Date().toISOString(),
    });

    return { deleted: true };
  }
}