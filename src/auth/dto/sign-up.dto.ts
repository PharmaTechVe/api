import { OmitType } from '@nestjs/swagger';
import { UserDTO } from 'src/user/dto/user.dto';

export class UserSignUpResponseDTO extends OmitType(UserDTO, [
  'password',
] as const) {}
