import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { NewRegisteredUser } from '@/dal/models/index';
export class AuthRegisterDto implements NewRegisteredUser {
  gbpuatId: number;
  gbpuatEmail: string;
  username: string;
  password: string;
}
