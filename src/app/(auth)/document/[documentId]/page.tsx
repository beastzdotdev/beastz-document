import { Metadata, ResolvingMetadata } from 'next';
import { constants } from '@/lib/constants';
import { DocumentByIdPageParams } from '@/app/(auth)/document/[documentId]/types';
import { DocumentEditor } from '@/app/(auth)/document/[documentId]/_components/document-editor';
import { DocumentEditorWrapper } from '@/app/(auth)/document/[documentId]/_components/document-editor-wrapper';

export async function generateMetadata(
  props: DocumentByIdPageParams,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const title = props.searchParams?.[constants.general.queryTitleForDocument] ?? '';
  const headerTitle = title ? `${title} - Beastz Doc` : 'Beastz Doc';

  return {
    title: headerTitle,
    description: `Editing and collaboration for document with title of ${headerTitle}`,
  };
}

export default async function DocumentByIdPage(): Promise<JSX.Element> {
  return (
    <>
      <DocumentEditorWrapper>
        <DocumentEditor />
      </DocumentEditorWrapper>
    </>
  );
}
