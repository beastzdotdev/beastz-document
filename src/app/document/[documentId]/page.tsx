import { DocumentByIdPageParams } from '@/app/document/[documentId]/types';
import { DocumentEditor } from '@/app/document/[documentId]/_components/document-editor';
import { Metadata, ResolvingMetadata } from 'next';

const title = 'Some title'; //TODO: this must be fetched from server (endpoint which returns only title)

export async function generateMetadata(
  _props: DocumentByIdPageParams,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: `${title} - Beast Doc`,
    description: `Editing and collaboration for document with title of ${title}`,
  };
}

export default async function DocumentByIdPage(): Promise<JSX.Element> {
  return (
    <>
      <DocumentEditor />
    </>
  );
}
