import { Gender } from '@/lib/enums/gender.enum';

export class UserResponseDto {
  id: number;
  email: string;
  userName: string;
  birthDate: string;
  gender: Gender;
  createdAt: Date;
  isOnline: boolean;
  profileImagePath: string | null;
  profileFullImagePath: string | null;
}
