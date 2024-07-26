import { DocumentByIdPageParams } from '@/app/document/[documentId]/types';
import { DocumentEditor } from '@/app/document/[documentId]/_components/document-editor';
import { Metadata, ResolvingMetadata } from 'next';
import { constants } from '@/lib/constants';

export async function generateMetadata(
  props: DocumentByIdPageParams,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const title = props.searchParams[constants.general.queryTitleForDocument] ?? '';
  const headerTitle = title ? `${title} - Beast Doc` : 'Beast Doc';

  return {
    title: headerTitle,
    description: `Editing and collaboration for document with title of ${headerTitle}`,
  };
}

export default async function DocumentByIdPage(): Promise<JSX.Element> {
  return (
    <>
      <DocumentEditor />
    </>
  );
}
