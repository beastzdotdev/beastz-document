import { FileMimeType } from '@/lib/enums/file-mimte-type.enum';
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

export class FileStructure {
  id: number;
  path: string;
  title: string;
  depth: number;
  color: string | null;
  sizeInBytes: number | null;
  fileExstensionRaw: string | null;
  mimeTypeRaw: string | null;
  mimeType: FileMimeType | null;
  lastModifiedAt: string;
  isEditable: boolean | null;
  isEncrypted: boolean | null;
  isLocked: boolean | null;
  isFile: boolean;
  createdAt: string;
  rootParentId: number | null;
  parentId: number | null;
  absRelativePath: string | null = null;
  children: FileStructure[] | null;
}

export class FileStructurePublicShare {
  id: number;
  userId: number;
  fileStructureId: number;
  uniqueHash: string;
  isDownloadable: boolean;
  isPasswordProtected: boolean;
  isDisabled: boolean;
  expiresAt: Date | null;
  password: string | null;
  createdAt: Date;
  joinLink: string;
}
