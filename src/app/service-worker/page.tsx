'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function EditorPage(): JSX.Element {
  useEffect(() => {
    console.log(123);

    if ('serviceWorker' in navigator) {
      console.log(1235);
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => console.log('scope is: ', registration.scope));
    }
  }, []);

  return (
    <>
      <h1>Service worker</h1>
    </>
  );
}
