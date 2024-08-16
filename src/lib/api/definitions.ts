import { AxiosResponse } from 'axios';
import { api } from '@/lib/api/api';
import { ClientApiError } from '@/lib/api/errors';
import { FileStructure, UserResponseDto } from '@/lib/api/type';
import { AxiosApiResponse } from '@/lib/types';
import { FileMimeType } from '@/lib/enums/file-mimte-type.enum';

export const secureHealthCheck = async (): Promise<AxiosApiResponse<void>> => {
  try {
    const result: AxiosResponse = await api.get('/health/secure');
    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const getCurrentUser = async (): Promise<AxiosApiResponse<UserResponseDto>> => {
  try {
    const result: AxiosResponse = await api.get('user/current');
    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const getFileStructures = async (): Promise<AxiosApiResponse<FileStructure[]>> => {
  try {
    const result: AxiosResponse<FileStructure[]> = await api.get('/file-structure', {
      params: {
        isFile: true,
        fileTypes: [FileMimeType.TEXT_MARKDOWN, FileMimeType.TEXT_PLAIN],
      },
    });

    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};
