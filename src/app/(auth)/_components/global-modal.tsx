'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useReducer } from 'react';
import { Card } from '@/components/ui/card';
import { CustomGlobalModal } from '@/components/ui/custom-global-modal';
import { bus } from '@/lib/bus';

export type GlobalModalType = 'notification';

type GlobalModalState = {
  isOpen: boolean;
  type: GlobalModalType | null;
  title: string;
  message: string;
  onClose?: () => void;
};

type GlobalModalAction =
  | { type: 'toggle'; payload: boolean }
  | {
      type: 'open-modal';
      payload: Pick<GlobalModalState, 'type' | 'title' | 'message' | 'onClose'>;
    };

const globalModalReducer = (state: GlobalModalState, { payload, type }: GlobalModalAction) => {
  switch (type) {
    case 'toggle':
      return { ...state, isOpen: payload };
    case 'open-modal':
      return { ...state, isOpen: true, ...payload };
    default: {
      return state;
    }
  }
};

//TODO: add transition on modal - https://headlessui.com/v1/react/dialog
export const GlobalModal = (): JSX.Element => {
  const [globalModalState, dispatch] = useReducer(globalModalReducer, {
    isOpen: false,
    type: null,
    title: '',
    message: '',
  });

  useEffect(() => {
    bus.on('open:global-model', payload => {
      dispatch({ type: 'open-modal', payload });
    });
  }, []);

  useEffect(() => {
    if (!globalModalState.isOpen) {
      globalModalState?.onClose?.();
    }
  }, [globalModalState]);

  console.log('rerended of global modal');

  return (
    <>
      <CustomGlobalModal
        isOpen={globalModalState.isOpen}
        setIsOpen={isOpen => dispatch({ type: 'toggle', payload: isOpen })}
      >
        <Card className="p-4 min-w-[650px]">
          <h1 className="text-xl font-semibold">{globalModalState.title}</h1>

          <p className="mt-2 text-sm/6">{globalModalState.message}</p>

          <div className="mt-4">
            <Button onClick={() => dispatch({ type: 'toggle', payload: false })}>
              Got it, thanks!
            </Button>
          </div>
        </Card>
      </CustomGlobalModal>
    </>
  );
};
