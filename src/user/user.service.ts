import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAdminDTO, UserDTO, UpdateUserDTO } from './dto/user.dto';
import { User, UserRole } from './entities/user.entity';
import { UserOTP } from './entities/user-otp.entity';
import { Profile } from './entities/profile.entity';
import { OTPType } from 'src/user/entities/user-otp.entity';
import { UserAddress } from './entities/user-address.entity';
import { CreateUserAddressDTO } from './dto/user-address.dto';
import { ConfigService } from '@nestjs/config';
import { UserMoto } from './entities/user-moto.entity';
import { UpdateUserMotoDTO } from './dto/user-moto.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserOTP)
    private userOTPRepository: Repository<UserOTP>,
    @InjectRepository(UserAddress)
    private UserAddressRepository: Repository<UserAddress>,
    @InjectRepository(UserMoto)
    private UserMotoRepository: Repository<UserMoto>,
    private configService: ConfigService,
  ) {}

  async userExists(options: Partial<User>): Promise<boolean> {
    const user = await this.userRepository.findOneBy(options);
    return !!user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('Invalid request');
    }
    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async findProfileByUserId(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id } },
    });
    if (!profile) {
      throw new NotFoundException(`Profile #${id} not found`);
    }
    return profile;
  }

  async findByOTP(otp: string): Promise<User> {
    const userOTP = await this.userOTPRepository.findOne({
      where: {
        code: otp,
      },
      relations: {
        user: true,
      },
    });
    if (!userOTP) {
      throw new NotFoundException('User not found');
    }
    if (userOTP.expiresAt < new Date()) {
      await this.userOTPRepository.remove(userOTP);
      throw new BadRequestException('OTP code has expired');
    }
    return userOTP.user;
  }

  async deleteOTP(otp: string, user: User): Promise<void> {
    const userOTP = await this.userOTPRepository.findOneBy({
      code: otp,
      user: {
        id: user.id,
      },
    });
    if (!userOTP) {
      throw new NotFoundException('User not found');
    }
    await this.userOTPRepository.remove(userOTP);
  }

  async create(userData: UserDTO): Promise<User> {
    const newUser = this.userRepository.create(userData);
    const user = await this.userRepository.save(newUser);
    const profile = new Profile();
    profile.user = user;
    if (userData.gender) {
      profile.gender = userData.gender;
    }
    profile.birthDate = new Date(userData.birthDate);
    await this.profileRepository.save(profile);
    return user;
  }

  async createAdmin(user: UserAdminDTO): Promise<User> {
    const emailUsed = await this.userExists({
      email: user.email,
    });
    if (emailUsed) {
      throw new BadRequestException('The email is already in use');
    }
    const documentUsed = await this.userExists({
      documentId: user.documentId,
    });
    if (documentUsed) {
      throw new BadRequestException('The document is already in use');
    }
    const password: string = this.configService.get('ADMIN_PASSWORD', '');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create(user);
    newUser.password = hashedPassword;
    const userCreated = await this.userRepository.save(newUser);
    const profile = new Profile();
    profile.user = userCreated;
    if (user.gender) {
      profile.gender = user.gender;
    }
    profile.birthDate = new Date(user.birthDate);
    await this.profileRepository.save(profile);

    if (user.role === UserRole.DELIVERY) {
      const userMoto = new UserMoto();
      userMoto.user = userCreated;
      userMoto.brand = user.brand || '';
      userMoto.model = user.model || '';
      userMoto.color = user.color || '';
      userMoto.plate = user.plate || '';
      userMoto.licenseUrl = user.licenseUrl || '';
      await this.UserMotoRepository.save(userMoto);
    }

    return userCreated;
  }

  async update(user: User, userData: Partial<UserDTO>): Promise<User> {
    const updateResult = await this.userRepository.update(user.id, userData);
    if (updateResult.affected !== 1) {
      throw new NotFoundException('User not found');
    }
    const userUpdated = await this.userRepository.findOneBy({ id: user.id });
    if (!userUpdated) {
      throw new NotFoundException('User not found');
    }
    return userUpdated;
  }

  async saveOTP(user: User, otp: string, otpType: OTPType): Promise<UserOTP> {
    const newOTP = new UserOTP();
    newOTP.user = user;
    newOTP.code = otp;
    newOTP.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    newOTP.type = otpType;
    return await this.userOTPRepository.save(newOTP);
  }
  async findUserOtpByUserAndCode(
    userId: string,
    otp: string,
  ): Promise<UserOTP | null> {
    return await this.userOTPRepository.findOne({
      where: { user: { id: userId }, code: otp },
      relations: ['user'],
    });
  }

  async validateEmail(userOtp: UserOTP): Promise<void> {
    if (userOtp.expiresAt < new Date()) {
      await this.userOTPRepository.remove(userOtp);
      throw new BadRequestException('OTP code has expired');
    }
    await this.userRepository.update(userOtp.user.id, { isValidated: true });
    await this.userOTPRepository.remove(userOtp);
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    return user;
  }

  async countActiveUsers(q?: string, role?: UserRole): Promise<number> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (q) {
      qb.andWhere(
        '(user.firstName ILIKE :q OR user.lastName ILIKE :q OR user.documentId ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    return qb.getCount();
  }

  async getActiveUsers(
    page: number,
    limit: number,
    q?: string,
    role?: UserRole,
  ): Promise<User[]> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.deletedAt IS NULL');

    if (q) {
      qb.andWhere(
        '(user.firstName ILIKE :q OR user.lastName ILIKE :q OR user.documentId ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getMany();
  }

  async deleteUser(userId: string): Promise<void> {
    const userToDelete = await this.userRepository.findOneBy({ id: userId });
    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }
    userToDelete.deletedAt = new Date();
    await this.userRepository.save(userToDelete);
  }

  async createAddress(
    userId: string,
    addressData: CreateUserAddressDTO,
  ): Promise<UserAddress> {
    const newAddress = this.UserAddressRepository.create({
      ...addressData,
      user: { id: userId },
      city: { id: addressData.cityId },
    });
    return await this.UserAddressRepository.save(newAddress);
  }

  async getAddress(userId: string, addressId: string): Promise<UserAddress> {
    const address = await this.UserAddressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
      relations: ['city', 'city.state', 'city.state.country'],
    });
    if (!address) {
      throw new NotFoundException('Address not found.');
    }
    return address;
  }

  async getListAddresses(userId: string): Promise<UserAddress[]> {
    const addresses = await this.UserAddressRepository.find({
      where: { user: { id: userId } },
      relations: ['city', 'city.state', 'city.state.country'],
    });
    if (!addresses.length) {
      throw new NotFoundException('No addresses found for this user.');
    }
    return addresses;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.UserAddressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    const result = await this.UserAddressRepository.softDelete(address.id);
    if (!result.affected) {
      throw new NotFoundException(`Address #${addressId} not found`);
    }
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateData: Partial<CreateUserAddressDTO>,
  ): Promise<UserAddress> {
    const address = await this.UserAddressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
      relations: ['city', 'city.state', 'city.state.country'],
    });
    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    const updatedAddress = await this.UserAddressRepository.save({
      ...address,
      ...updateData,
      city: updateData.cityId ? { id: updateData.cityId } : address.city,
    });

    const addressWithRelations = await this.getAddress(
      userId,
      updatedAddress.id,
    );
    return addressWithRelations;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDTO): Promise<User> {
    const user = await this.findUserById(id);
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return await this.userRepository.save(updatedUser);
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDTO,
  ): Promise<Profile> {
    const profile = await this.findProfileByUserId(id);
    const updatedprofile = this.profileRepository.merge(profile, updateUserDto);
    return await this.profileRepository.save(updatedprofile);
  }

  async updateUserMoto(
    userId: string,
    updateMotoDto: UpdateUserMotoDTO,
  ): Promise<UserMoto> {
    const userMoto = await this.UserMotoRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userMoto) {
      throw new NotFoundException('User moto not found');
    }
    const updatedMoto = this.UserMotoRepository.merge(userMoto, updateMotoDto);
    return await this.UserMotoRepository.save(updatedMoto);
  }

  async countNewUsers(startDate: Date, endDate: Date): Promise<number> {
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where(`DATE(user.created_at) BETWEEN :start AND :end`, {
        start: startStr,
        end: endStr,
      });

    return qb.getCount();
  }
}
