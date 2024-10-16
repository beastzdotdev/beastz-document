'use client';

import { AxiosResponse, HttpStatusCode } from 'axios';
import { api, apiPure } from '@/lib/api/api';
import { ClientApiError } from '@/lib/api/errors';
import {
  FileStructure,
  FileStructurePublicShare,
  PublicFileStructurePublicShare,
  UserResponseDto,
} from '@/lib/api/type';
import { AxiosApiResponse } from '@/lib/types';
import { FileMimeType } from '@/lib/enums/file-mimte-type.enum';
import { ExceptionMessageCode } from '@/lib/enums/exception-message-code.enum';

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

export const moveToBin = async (id: number): Promise<AxiosApiResponse<void>> => {
  try {
    await api.patch<void>(`file-structure/move-to-bin/${id}`);

    return {};
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const replaceFileStructureText = async (
  id: number | string,
  params: { text: string; checkEditMode?: boolean },
): Promise<AxiosApiResponse<void>> => {
  try {
    const { text, checkEditMode } = params;
    const result: AxiosResponse<void> = await api.patch(`/file-structure/replace-text/${id}`, {
      text,
      checkEditMode,
    });

    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};

export const getFsPublicSharePublic = async (
  sharedUniqueHash: string,
): Promise<AxiosApiResponse<{ data: PublicFileStructurePublicShare | null; enabled: boolean }>> => {
  try {
    const result: AxiosResponse<{ data: PublicFileStructurePublicShare | null; enabled: boolean }> =
      await apiPure.get(`/file-structure-public-share/is-enabled-public/${sharedUniqueHash}`);

    return { data: result.data };
  } catch (e: unknown) {
    return {
      error: new ClientApiError(
        HttpStatusCode.InternalServerError,
        ExceptionMessageCode.CLIENT_OR_INTERNAL_ERROR,
        e,
      ),
    };
  }
};

export const getDocumentTextPublic = async (
  sharedUniqueHash: string,
): Promise<AxiosApiResponse<string>> => {
  try {
    const textResponse: AxiosResponse<string> = await apiPure.get(
      `/file-structure/document-text-public/${sharedUniqueHash}`,
      {
        responseType: 'text',
      },
    );

    return { data: textResponse.data };
  } catch (e: unknown) {
    return {
      error: new ClientApiError(
        HttpStatusCode.InternalServerError,
        ExceptionMessageCode.CLIENT_OR_INTERNAL_ERROR,
        e,
      ),
    };
  }
};
export const getCollabActiveParticipantsPublic = async (
  fsId: number,
): Promise<AxiosApiResponse<string[]>> => {
  try {
    const numberResponse: AxiosResponse<string[]> = await apiPure.get(
      `/file-structure-public-share/collab-active-participants-public/${fsId}`,
    );

    return { data: numberResponse.data };
  } catch (e: unknown) {
    return {
      error: new ClientApiError(
        HttpStatusCode.InternalServerError,
        ExceptionMessageCode.CLIENT_OR_INTERNAL_ERROR,
        e,
      ),
    };
  }
};
