import { ExceptionMessageCode } from '@/lib/enums/exception-message-code.enum';
import { z } from 'zod';

export const ExceptionSchema = z.object({
  message: z.nativeEnum(ExceptionMessageCode),
  statusCode: z.number(),
});

export type ExceptionResponse = z.infer<typeof ExceptionSchema>;
