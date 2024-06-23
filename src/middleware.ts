import { env } from '@/lib/env';
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextFetchEvent, NextRequest } from 'next/server';

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  return authkitMiddleware({ debug: env.WORKOS_DEBUG })(req, event);
}
