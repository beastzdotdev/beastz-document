'use client';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingIcon } from '@/components/icons';
import { bus } from '@/lib/bus';
import { copyToClipboard, sleep } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import { secureHealthCheck } from '@/lib/api/definitions';
import { useSocketStore } from '@/app/(auth)/document/state';

const url = 'https://joincollab/join?toke=asdas121koks102120s1k10ks019291k109';

export const CollabButton = () => {
  const socketStatus = useSocketStore(state => state.status);

  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const wasPopoverShownOnce = useRef(false);
  // const [showPopoverOnce, setShowPopoverOnce] = useState(false);

  const onClick = useCallback(async () => {
    if (docEditSocket.connected) {
      return;
    }

    setLoading(true);

    const { error } = await secureHealthCheck();
    if (error) {
      return;
    }

    // health check before connecting to socket
    docEditSocket.connect();
  }, []);

  const onCopy = useCallback(async () => {
    setIsCopied(true);
    copyToClipboard(url);

    toast.success('Copied to clipboard');
  }, []);

  useEffect(() => {
    useSocketStore.subscribe(state => {
      if (state.status === 'connected' && !wasPopoverShownOnce.current) {
        wasPopoverShownOnce.current = true;
        setIsPopoverOpen(true);
      }

      if (state.status === 'connected' || state.status === 'disconnected') {
        setLoading(false);
        setIsCopied(false);
      }
    });
  }, []);

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        {socketStatus === 'connected' ? (
          <PopoverTrigger asChild>
            <Button variant="default" className="rounded-full">
              <Icon icon="fluent:people-team-20-filled" className="mr-2 text-xl" />
              Collab
            </Button>
          </PopoverTrigger>
        ) : (
          <Button variant="default" className="rounded-full" onClick={onClick} disabled={loading}>
            <span className="w-7">
              {loading ? (
                <LoadingIcon className="mr-2" />
              ) : (
                <Icon icon="fluent:people-team-20-filled" className="mr-2 text-xl" />
              )}
            </span>
            Collab
          </Button>
        )}

        <PopoverContent
          className="p-1.5 min-w-80 mr-16 mt-2"
          onCloseAutoFocus={() => setIsCopied(false)}
        >
          <div>
            <Alert className="border-none">
              <Icon icon="mdi:invite" className="text-xl !top-3" />
              <AlertTitle>Invite Link</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                <div>Do not share this link with anyone you do not want to collaborate with !</div>
                <div className="flex w-full items-center space-x-2 mt-3">
                  <Input className="flex-1 cursor-default" value={url} readOnly />
                  <Button onClick={onCopy} className="w-16">
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
