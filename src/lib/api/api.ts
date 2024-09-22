import axios, { AxiosError, CreateAxiosDefaults, HttpStatusCode } from 'axios';
import { ClientApiError, ExceptionSchema } from '@/lib/api/errors';
import { bus } from '@/lib/bus';
import { constants } from '@/lib/constants';
import { ExceptionMessageCode } from '@/lib/enums/exception-message-code.enum';
import { HandleRefreshType } from '@/lib/types';
import { cleanURL } from '@/lib/utils';

export const errNetworkText = 'Network Error';

const axiosConfigs: CreateAxiosDefaults = {
  baseURL: constants.path.backend.baseUrl,
  headers: { platform: 'WEB' },
  withCredentials: true,
};

export const apiPure = axios.create(axiosConfigs); // this does not have anything like interceptor, handlers, ...
export const api = axios.create(axiosConfigs);

api.interceptors.response.use(r => r, handleAxiosResponseError);

// needs to be like this
let refreshingFunc: Promise<HandleRefreshType> | undefined;

const redirectToAuthSignin = () => {
  const url = new URL(constants.externalLinks.signIn);
  url.searchParams.set('redirect', cleanURL(constants.path.home).toString());
  window.location.assign(url.toString());
};

const redirectToOops = (text?: string) => {
  const seconParams = text ? { text } : undefined;
  // window.location.assign(cleanURL(constants.path.oops, seconParams).toString());
};

const redirectToVerify = () => {
  window.location.assign(constants.externalLinks.authVerify);
};

const alertAndRedirect = (message: string, type: 'oops' | 'sign-in' | 'verify') => {
  bus.emit('open:global-model', {
    message,
    onClose: () => {
      switch (type) {
        case 'oops':
          redirectToOops();
        case 'sign-in':
          redirectToAuthSignin();
          break;
        case 'verify':
          redirectToVerify();
          break;
      }
    },
    title: 'Notification',
    type: 'notification',
  });
};

/**
 * @description when status is forbidden then post refresh and get new access/refresh tokens
 *              and restart last api request, if refresh has any type of problem we do not care
 *              it should not happen if everything is correctly done
 */
async function handleAxiosResponseError(error: unknown) {
  const generalClientError = new ClientApiError(
    HttpStatusCode.InternalServerError,
    ExceptionMessageCode.CLIENT_OR_INTERNAL_ERROR,
    error,
  );

  try {
    if (error instanceof AxiosError) {
      const originalConfig = error.config;
      let responseBody = error.response?.data;

      if (responseBody instanceof Blob) {
        responseBody = JSON.parse(await responseBody.text());
      }

      const exceptionBody = await ExceptionSchema.passthrough().safeParseAsync(responseBody);

      // this should not happen, router.navigate to oops
      if (!originalConfig) {
        redirectToOops();

        return Promise.reject(
          new ClientApiError(HttpStatusCode.InternalServerError, ExceptionMessageCode.CLIENT_OR_INTERNAL_ERROR, error),
        );
      }

      if (exceptionBody.success) {
        const needsRefresh =
          exceptionBody.data.message === ExceptionMessageCode.ACCESS_EXPIRED_TOKEN &&
          exceptionBody.data.statusCode === HttpStatusCode.Unauthorized;

        const clientAPiError = new ClientApiError(exceptionBody.data.statusCode, exceptionBody.data.message, error);

        if (needsRefresh) {
          // const data = await handleRefresh();
          if (!refreshingFunc) refreshingFunc = handleRefresh();

          const data = await refreshingFunc;

          // refresh token unsuccessfull
          if (!data.success) {
            // show alert and redirect
            handleUserExceptionsInRefresh(data.message);
            return Promise.reject(clientAPiError);
          }

          // refresh was successfull, retry original request
          return await api.request(originalConfig);
        }

        // here if refresh was not needed but returned error
        handleUserExceptionsInAccess(exceptionBody.data.message);
        return Promise.reject(clientAPiError);
      }

      if (error.code === AxiosError.ERR_NETWORK) {
        // hard refresh on network err
        redirectToOops(errNetworkText);
        return Promise.reject(generalClientError);
      }
    }

    // unknown error, navigate to oops
    redirectToOops();
    return Promise.reject(generalClientError);
  } catch (error) {
    console.log(error);
  } finally {
    refreshingFunc = undefined;
  }
}

/**
 * @description handle refresh call everything must go smoothly. any type of problem must
 *              be met with localstorage clear and redirect to sign in page
 */
async function handleRefresh(): Promise<HandleRefreshType> {
  try {
    await apiPure.post<void>('auth/refresh');
    return { success: true };
  } catch (error) {
    if (error instanceof AxiosError) {
      return { success: false, message: error.response?.data?.message };
    }

    return { success: false };
  }
}

// this handler is only for this file and this api instance

/**
 * @description handler is only for this file and this api instance and only for refresh exception
 */
function handleUserExceptionsInRefresh(message?: ExceptionMessageCode) {
  // if message is not returned this will pop up, unexpected
  if (!message) {
    alertAndRedirect('Something unexpected happend, message was not given', 'oops');
    return;
  }

  switch (message) {
    case ExceptionMessageCode.USER_NOT_VERIFIED:
      alertAndRedirect('User not verified', 'verify');
      break;
    case ExceptionMessageCode.USER_BLOCKED:
      alertAndRedirect('User is blocked, please contact our support', 'sign-in');
      break;
    case ExceptionMessageCode.USER_LOCKED:
      alertAndRedirect('User is locked, please verify account again', 'sign-in');
      break;
    default:
      alertAndRedirect('Session expired', 'sign-in');
      break;
  }
}

/**
 * @description handler is only for this file and this api instance and only for accesss exception
 */
function handleUserExceptionsInAccess(message?: ExceptionMessageCode) {
  // if message is not returned this will pop up, unexpected
  if (!message) {
    alertAndRedirect('Something unexpected happend, message was not given', 'oops');
    return;
  }

  // is token expired than just get out
  if (message === ExceptionMessageCode.ACCESS_EXPIRED_TOKEN) {
    return;
  }

  // just check block, lock and not verified
  switch (message) {
    case ExceptionMessageCode.USER_NOT_VERIFIED:
      alertAndRedirect('User not verified', 'verify');
      break;
    case ExceptionMessageCode.USER_BLOCKED:
      alertAndRedirect('User is blocked, please contact our support', 'sign-in');
      break;
    case ExceptionMessageCode.USER_LOCKED:
      alertAndRedirect('User is locked, please verify account again', 'sign-in');
      break;
    case ExceptionMessageCode.MISSING_TOKEN:
    case ExceptionMessageCode.INVALID_TOKEN:
      alertAndRedirect('Session expired', 'sign-in');
      break;
  }
}
