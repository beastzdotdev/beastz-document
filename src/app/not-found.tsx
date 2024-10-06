'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Custom404() {
  const searchParams = useSearchParams();
  const router = useRouter();

  if (searchParams.get('message')) {
    return (
      <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8 bg-black">
        <div className="text-center">
          <p className="text-8xl font-semibold text-indigo-600">Oops</p>
          <p className="mt-6 leading-7 text-xl text-gray-100">{searchParams.get('message')}</p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={() => router.back()}
              className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8 bg-black">
      <div className="text-center">
        <p className="text-9xl font-semibold text-indigo-600">404</p>
        <p className="mt-6 text-base leading-7 text-gray-300">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/home"
            className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
