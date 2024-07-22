// 'use server';

import { DocumentLayout } from '@/app/_layout/document-layout';
import { RegularLayout } from '@/app/_layout/regular-layout';
import { constants } from '@/lib/constants';
import { headers } from 'next/headers';

type Props = {
  children: React.ReactNode;
};

//TODO: just create client component for layout because layout.js renders once and this does not work on rerouting
//TODO: plus its just three pages i think for now (root, document, settings)

export const AppLayout = ({ children }: Props): JSX.Element => {
  //TODO: this needs refactoring
  const pathname = headers().get(constants.headers.pathname)!;
  const isDocumentPage = pathname.startsWith('/document');

  if (isDocumentPage) {
    return <DocumentLayout>{children}</DocumentLayout>;
  }

  return <RegularLayout>{children}</RegularLayout>;
};
