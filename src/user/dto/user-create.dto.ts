import { IntersectionType } from '@nestjs/mapped-types';
import { UserDTO } from './user.dto';
import { PasswordDTO } from 'src/auth/dto/password.dto';

export class UserCreateDTO extends IntersectionType(UserDTO, PasswordDTO) {}
