import { ExceptionMessageCode } from '@/lib/enums/exception-message-code.enum';

export class ClientApiError<T = unknown> {
  constructor(
    public readonly statusCode: number,
    public readonly message: ExceptionMessageCode,
    public readonly error: T
  ) {}
}
