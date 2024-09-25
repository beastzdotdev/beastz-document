'use client';

import { AxiosResponse } from 'axios';
import { api } from '@/lib/api/api';
import { ClientApiError } from '@/lib/api/errors';
import { FileStructure, FileStructurePublicShare, UserResponseDto } from '@/lib/api/type';
import { AxiosApiResponse } from '@/lib/types';
import { FileMimeType } from '@/lib/enums/file-mimte-type.enum';

export const getText = async (url: string): Promise<AxiosApiResponse<string>> => {
  try {
    const textResponse: AxiosResponse<string> = await api.get(url, { responseType: 'text' });
    return { data: textResponse.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const getDocumentText = async (fsId: number): Promise<AxiosApiResponse<string>> => {
  try {
    const textResponse: AxiosResponse<string> = await api.get(
      `/file-structure/document-text/${fsId}`,
      {
        responseType: 'text',
      },
    );

    return { data: textResponse.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

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

export const getFileStructureById = async (
  id: number,
): Promise<AxiosApiResponse<FileStructure>> => {
  try {
    const result: AxiosResponse<FileStructure> = await api.get(`/file-structure/${id}`);

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
        orderByLastModifiedAt: 'desc',
      },
    });

    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const createFileStructurePublicShare = async (
  fileStructureId: number,
): Promise<AxiosApiResponse<FileStructurePublicShare>> => {
  try {
    const result: AxiosResponse<FileStructurePublicShare> = await api.post(
      '/file-structure-public-share',
      {
        fileStructureId,
      },
    );

    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const getFileStructurePublicShareEnabled = async (
  fsId: number,
): Promise<AxiosApiResponse<{ enabled: boolean; data: FileStructurePublicShare | null }>> => {
  try {
    const result: AxiosResponse<{ enabled: boolean; data: FileStructurePublicShare | null }> =
      await api.get(`/file-structure-public-share/is-enabled/${fsId}`);
    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const getFileStructurePublicShare = async (
  fileStructureId: number,
): Promise<AxiosApiResponse<FileStructurePublicShare>> => {
  try {
    const result: AxiosResponse<FileStructurePublicShare> = await api.get(
      '/file-structure-public-share/get-by',
      {
        params: {
          fileStructureId,
        },
      },
    );

    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const updateFileStructurePublicShare = async (
  id: number,
  params: { isDisabled: boolean },
): Promise<AxiosApiResponse<FileStructurePublicShare>> => {
  try {
    const { isDisabled } = params;
    const result: AxiosResponse<FileStructurePublicShare> = await api.patch(
      `/file-structure-public-share/${id}`,
      {
        isDisabled,
      },
    );

    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};
