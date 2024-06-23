import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextFetchEvent, NextRequest } from 'next/server';

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  return authkitMiddleware({ debug: true })(req, event);
}
