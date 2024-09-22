'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Custom404() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  if (searchParams.get('message')) {
    return (
      <div className="flex flex-col items-center justify-center pt-10">
        <h1 className="text-2xl">404 - {searchParams.get('message')}</h1>
        <Button className="w-24 mt-5" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return <Test />;
  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <h1 className="text-2xl">404 - Something went wrong</h1>
      <Button className="w-24 mt-5" onClick={goBack}>
        Go Back
      </Button>
    </div>
  );
}

function Test() {
  return (
    <main className="grid min-h-full place-items-center bg-primary px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/home"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </Link>

          <a href="#" className="text-sm font-semibold text-gray-900">
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
