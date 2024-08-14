'use client';

import Image from 'next/image';
import { bus } from '@/lib/bus';
import { sleep } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const randImg =
  'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export const JoinedPeople = ({ people }: { people: { name: string }[] }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // native listener in different file !
    bus.on('socket:connected', async () => {
      await sleep(1000);
      setShow(true);
    });
  }, []);

  if (!show || !people.length) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex -space-x-4 rtl:space-x-reverse cursor-pointer">
          {people.length <= 2 ? (
            people.map((e, i) => (
              <Image
                src={randImg}
                key={i}
                priority
                alt="a"
                width={40}
                height={40}
                className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
              />
            ))
          ) : (
            <>
              <Image
                src={randImg}
                priority
                alt="a"
                width={40}
                height={40}
                className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
              />
              <Image
                src={randImg}
                priority
                alt="a"
                width={40}
                height={40}
                className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
              />

              <span className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-muted border-2 border-white rounded-full dark:border-gray-800">
                +{people.length - 2}
              </span>
            </>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-1.5">
        <Table className="min-w-56">
          <TableBody>
            {people.map((e, i) => (
              <TableRow className="rounded-xl border-none hover:bg-transparent" key={i}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell className="flex justify-end">
                  <Button className="h-6 flex items-center" variant="destructive">
                    Kick
                    <Icon icon="mdi:ban" className="text-sm ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="rounded-xl border-none hover:bg-transparent pt-2">
              {/* Needed here */}
              <TableCell />

              <TableCell className="flex justify-end">
                <Button className="h-6 flex items-center" variant="destructive">
                  Disconnect
                  <Icon icon="fluent:plug-disconnected-48-regular" className="text-xl ml-1" />
                  {/* <Icon icon="mdi:ban" className="text-sm ml-1" /> */}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>

          {/*  */}
        </Table>
      </PopoverContent>
    </Popover>
  );
};
