import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDTO } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserOTP } from './entities/user-otp.entity';
import { Profile } from './entities/profile.entity';
import { OTPType } from 'src/user/entities/user-otp.entity';
import { ProfileDTO } from './dto/profile.dto';
import { IsNull } from 'typeorm';
import { UserAdress } from './entities/user-address.entity';
import { CreateUserAddressDTO } from './dto/create-user-address.dto';
import { plainToInstance } from 'class-transformer';

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

  async getUserProfile(userId: string): Promise<ProfileDTO> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      email: profile.user.email,
      documentId: profile.user.documentId,
      phoneNumber: profile.user.phoneNumber,
      birthDate: profile.birthDate,
      gender: profile.gender,
      profilePicture: profile.profilePicture,
      role: profile.user.role,
    };
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
  ): Promise<CreateUserAddressDTO> {
    const newAddress = this.UserAdressRepository.create({
      ...addressData,
      user: { id: userId },
      city: { id: addressData.cityId },
    });
    const savedAddress = await this.UserAdressRepository.save(newAddress);

    return {
      id: savedAddress.id,
      adress: savedAddress.adress,
      zipCode: savedAddress.zipCode,
      latitude: savedAddress.latitude,
      longitude: savedAddress.longitude,
      cityId: addressData.cityId,
    };
  }

  async getAddress(
    userId: string,
    addressId: string,
  ): Promise<CreateUserAddressDTO> {
    const address = await this.UserAdressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
      relations: ['city', 'city.state', 'city.state.country'],
    });
    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    return plainToInstance(CreateUserAddressDTO, {
      id: address.id,
      adress: address.adress,
      zipCode: address.zipCode,
      latitude: address.latitude,
      longitude: address.longitude,
      cityId: address.city ? address.city.id : null,
      nameCity: address.city.name,
      nameState: address.city.state.name,
      nameCountry: address.city.state.country.name,
    });
  }

  async getListAddresses(userId: string): Promise<CreateUserAddressDTO[]> {
    const addresses = await this.UserAdressRepository.find({
      where: { user: { id: userId } },
      relations: ['city', 'city.state', 'city.state.country'],
    });
    if (!addresses.length) {
      throw new NotFoundException('No addresses found for this user.');
    }
    return addresses.map((address) =>
      plainToInstance(CreateUserAddressDTO, {
        id: address.id,
        adress: address.adress,
        zipCode: address.zipCode,
        latitude: address.latitude,
        longitude: address.longitude,
        cityId: address.city ? address.city.id : null,
        nameCity: address.city.name,
        nameState: address.city.state.name,
        nameCountry: address.city.state.country.name,
      }),
    );
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
  ): Promise<CreateUserAddressDTO> {
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
    return plainToInstance(CreateUserAddressDTO, {
      id: updatedAddress.id,
      adress: updatedAddress.adress,
      zipCode: updatedAddress.zipCode,
      latitude: updatedAddress.latitude,
      longitude: updatedAddress.longitude,
      cityId: updatedAddress.city ? updatedAddress.city.id : null,
      nameCity: updatedAddress.city.name,
      nameState: updatedAddress.city.state.name,
      nameCountry: updatedAddress.city.state.country.name,
    });
  }
}
