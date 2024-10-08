'use client';

import {
  docEditSocket,
  docEditSocketPublic,
} from '@/app/(auth)/document/[documentId]/_components/socket';
import { Card } from '@/components/ui/card';
import { getCollabActiveParticipantsPublic } from '@/lib/api/definitions';
import { constants } from '@/lib/constants';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export const JoinedPeopleAmount = (props: { isServant: boolean }) => {
  const { isServant } = props;
  const searchParams = useSearchParams();

  const [joinedPeople, setJoinedPeople] = useState<string[]>([]);
  const [render, setRender] = useState(false);

  const init = useCallback(async () => {
    let fsId: number;

    if (isServant) {
      const filesStructureId = parseInt(searchParams.get('fsId') ?? '');

      if (typeof filesStructureId !== 'number') {
        throw new Error('Something went wrong');
      }

      fsId = filesStructureId;
    } else {
      console.log(window.location.pathname.split('/'));

      const filesStructureId = parseInt(window.location.pathname.split('/').pop() ?? '');

      if (typeof filesStructureId !== 'number') {
        throw new Error('Something went wrong');
      }

      fsId = filesStructureId;
    }

    const { data, error } = await getCollabActiveParticipantsPublic({ fsId, isServant });

    if (error || !data) {
      return;
    }

    setJoinedPeople(data);
    setRender(true);

    if (isServant) {
      docEditSocketPublic.on(constants.socket.events.UserJoined, (data: { socketId: string }) => {
        setJoinedPeople(prev => [...new Set([...prev, data.socketId])]);
      });
      docEditSocketPublic.on(constants.socket.events.UserLeft, (data: { socketId: string }) => {
        setJoinedPeople(prev => prev.filter(id => id !== data.socketId));
      });
    } else {
      docEditSocket.on(constants.socket.events.UserJoined, (data: { socketId: string }) => {
        setJoinedPeople(prev => [...new Set([...prev, data.socketId])]);
      });
      docEditSocket.on(constants.socket.events.UserLeft, (data: { socketId: string }) => {
        setJoinedPeople(prev => prev.filter(id => id !== data.socketId));
      });
    }
  }, [isServant, searchParams]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!render) {
    return null;
  }

  return <Card className="p-2 px-5 cursor-default select-none">Joined {joinedPeople.length}</Card>;
};
