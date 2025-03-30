import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAdminDTO, UserDTO } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserOTP } from './entities/user-otp.entity';
import { Profile } from './entities/profile.entity';
import { OTPType } from 'src/user/entities/user-otp.entity';
import { IsNull } from 'typeorm';
import { UserAdress } from './entities/user-address.entity';
import { CreateUserAddressDTO } from './dto/create-user-address.dto';
import { UpdateUserDTO } from './dto/user-update.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserOTP)
    private userOTPRepository: Repository<UserOTP>,
    @InjectRepository(UserAdress)
    private UserAdressRepository: Repository<UserAdress>,
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

  async countActiveUsers(): Promise<number> {
    return this.userRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  async getActiveUsers(page: number, limit: number): Promise<User[]> {
    return this.userRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['profile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
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
  ): Promise<UserAdress> {
    const newAddress = this.UserAdressRepository.create({
      ...addressData,
      user: { id: userId },
      city: { id: addressData.cityId },
    });
    return await this.UserAdressRepository.save(newAddress);
  }

  async getAddress(userId: string, addressId: string): Promise<UserAdress> {
    const address = await this.UserAdressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
      relations: ['city', 'city.state', 'city.state.country'],
    });
    if (!address) {
      throw new NotFoundException('Address not found.');
    }
    return address;
  }

  async getListAddresses(userId: string): Promise<UserAdress[]> {
    const addresses = await this.UserAdressRepository.find({
      where: { user: { id: userId } },
      relations: ['city', 'city.state', 'city.state.country'],
    });
    if (!addresses.length) {
      throw new NotFoundException('No addresses found for this user.');
    }
    return addresses;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.UserAdressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    const result = await this.UserAdressRepository.softDelete(address.id);
    if (!result.affected) {
      throw new NotFoundException(`Address #${addressId} not found`);
    }
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateData: Partial<CreateUserAddressDTO>,
  ): Promise<UserAdress> {
    const address = await this.UserAdressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
      relations: ['city', 'city.state', 'city.state.country'],
    });
    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    const updatedAddress = await this.UserAdressRepository.save({
      ...address,
      ...updateData,
      city: updateData.cityId ? { id: updateData.cityId } : address.city,
    });
    return updatedAddress;
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
}
