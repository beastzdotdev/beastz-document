import { PublicDocumentEditor } from '@/app/collab-join/public-document-editor';
import { CollabJoinPageProps } from '@/app/collab-join/type';
import { Metadata, ResolvingMetadata } from 'next';

export const runtime = 'edge';

export async function generateMetadata(
  props: CollabJoinPageProps,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const title: string = props.searchParams?.title ?? '';
  const headerTitle = title ? `${title} - Beastz Doc` : 'Beastz Doc';

  return {
    title: headerTitle,
    description: `Editing and collaboration for document with title of ${headerTitle}`,
  };
}

export default function CollabJoin(params: CollabJoinPageProps) {
  return (
    <>
      <PublicDocumentEditor />
    </>
  );
}
