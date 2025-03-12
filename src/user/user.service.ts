import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDTO } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }

  async create(userData: UserDTO): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  async findActiveUsers(
    page: number,
    limit: number,
  ): Promise<{
    totalItems: number;
    totalPages: number;
    currentPage: number;
    users: User[];
  }> {
    const totalItems = await this.userRepository
      .createQueryBuilder('user')
      .where('user.isValidated = :isValidated', { isValidated: true })
      .getCount();
    const totalPages = Math.ceil(totalItems / limit);
    const users = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.createdAt',
        'user.updatedAt',
        'user.deletedAt',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.documentId',
        'user.phoneNumber',
        'user.isValidated',
        'user.lastOrderDate',
        'user.role',
      ])
      .where('user.isValidated = :isValidated', { isValidated: true })
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return {
      totalItems,
      totalPages,
      currentPage: page,
      users,
    };
  }
}
