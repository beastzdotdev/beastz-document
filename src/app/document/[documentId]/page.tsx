import { DocumentByIdPageParams } from '@/app/document/[documentId]/types';
import { DocumentEditor } from '@/app/document/[documentId]/document-editor';
import { Metadata } from 'next';

export default async function DocumentByIdPage(): Promise<JSX.Element> {
  return (
    <>
      <DocumentEditor />
    </>
  );
}
