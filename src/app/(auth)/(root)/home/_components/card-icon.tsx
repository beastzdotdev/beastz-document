import { DocumentTextIcon, DocumentMarkdownIcon, DocumentIcon } from '@/components/icons';
import { FileStructure } from '@/lib/api/type';
import { FileMimeType } from '@/lib/enums/file-mimte-type.enum';

export const CardIcon = ({
  item,
  className,
}: {
  item: FileStructure;
  className?: string;
}): JSX.Element => {
  switch (item.mimeType) {
    case FileMimeType.TEXT_PLAIN:
      return <DocumentTextIcon className={className} />;
    case FileMimeType.TEXT_MARKDOWN:
      return <DocumentMarkdownIcon className={className} />;
    default:
      return <DocumentIcon className={className} />;
  }
};
