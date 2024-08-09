import { api } from '@/lib/api/api';
import { ClientApiError } from '@/lib/api/errors';
import { AxiosApiResponse } from '@/lib/types';
import { AxiosResponse } from 'axios';

export const secureHealthCheck = async (): Promise<AxiosApiResponse<void>> => {
  try {
    const result: AxiosResponse = await api.get('/health/secure');
    return { data: result.data };
  } catch (e: unknown) {
    return { error: e as ClientApiError };
  }
};
