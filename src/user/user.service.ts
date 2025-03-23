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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserOTP)
    private userOTPRepository: Repository<UserOTP>,
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
}
