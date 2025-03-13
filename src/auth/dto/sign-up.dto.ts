import { OmitType } from '@nestjs/swagger';
import { UserCreateDTO } from 'src/user/dto/user-create.dto';

export class UserSignUpResponseDTO extends OmitType(UserCreateDTO, [
  'password',
] as const) {}
