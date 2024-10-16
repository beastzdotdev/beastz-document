'use client';

import { useJoinedPeopleStore } from '@/app/(auth)/document/[documentId]/state';
import { Card } from '@/components/ui/card';

export const JoinedPeopleAmount = (props: { isServant: boolean }) => {
  const joinedPeopleStore = useJoinedPeopleStore();

  if (!joinedPeopleStore.people.length) {
    return null;
  }

  // return (
  //   <Card className="p-2 px-5 cursor-default select-none">
  //     {JSON.stringify(joinedPeopleStore.people)}
  //   </Card>
  // );

  return (
    <Card className="p-2 px-5 cursor-default select-none shadow-none">
      Joined {joinedPeopleStore.people.length}
    </Card>
  );
};
