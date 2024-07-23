'use client';

import { ReactPropsWithChildren } from '@/lib/types';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';

type Props = ReactPropsWithChildren<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>;

const CustomGlobalModal = ({ children, isOpen, setIsOpen }: Props): JSX.Element => {
  return (
    <>
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => setIsOpen(false)}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex w-screen items-center justify-center">
          <DialogPanel>{children}</DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export { CustomGlobalModal };
