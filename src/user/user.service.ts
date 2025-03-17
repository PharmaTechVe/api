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
import { OtpDTO } from './dto/otp.dto';

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
      throw new NotFoundException('User not found');
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
    profile.gender = userData.gender;
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

  async saveOTP(user: User, otp: string): Promise<UserOTP> {
    const newOTP = new UserOTP();
    newOTP.user = user;
    newOTP.code = otp;
    newOTP.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    return await this.userOTPRepository.save(newOTP);
  }
  async validateEmail(userId: string, otpDto: OtpDTO): Promise<void> {
    const { otp } = otpDto;

    const userOtp = await this.userOTPRepository.findOne({
      where: { user: { id: userId }, code: otp },
      relations: ['user'],
    });

    if (!userOtp) {
      throw new NotFoundException('Invalid or not found OTP code');
    }
    if (userOtp.expiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired');
    }
    await this.userRepository.update(userId, { isValidated: true });
    await this.userOTPRepository.remove(userOtp);
  }
}
