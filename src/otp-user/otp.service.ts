import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOTP } from 'src/otp-user/entities/user-otp.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(UserOTP)
    private readonly otpRepository: Repository<UserOTP>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUserEmail(userId: string, code: string): Promise<void> {
    // Buscar el OTP asociado al usuario
    const userOtp = await this.otpRepository.findOneBy({
      user: { id: userId },
    });

    if (!userOtp) {
      throw new NotFoundException(
        'No se encontró un código OTP para el usuario',
      );
    }

    // Validar que el código coincida
    if (userOtp.code !== code) {
      throw new BadRequestException('Código OTP inválido');
    }

    // Validar que no haya expirado
    const now = new Date();
    if (now > userOtp.expiresAt) {
      throw new BadRequestException('El código OTP ha expirado');
    }

    // Actualizar el usuario: set isValidated a true
    await this.userRepository.update(userId, { isValidated: true });

    // Eliminar físicamente el registro del OTP
    await this.otpRepository.delete(userOtp.id);
  }

  // Método auxiliar para generar y reenviar OTP (help resend)
  async createAndSendOTP(user: User): Promise<void> {
    // Genera un código numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Expira en 1 día

    // Guarda el OTP en la base de datos
    const otp = this.otpRepository.create({ user, code, expiresAt });
    await this.otpRepository.save(otp);

    // Aquí puedes integrar el helper para enviar el correo:
    // Ejemplo: await this.emailService.sendOTPEmail(user.email, code);
  }
}
