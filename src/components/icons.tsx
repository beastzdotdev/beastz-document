import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

type Props = {
  className?: string;
};

export const DocumentIcon = ({ className }: Props): JSX.Element => (
  <Icon icon="solar:document-linear" className={cn(`text-xl`, className)} />
);

export const DocumentTextIcon = ({ className }: Props): JSX.Element => (
  <Icon icon="icon-park-outline:file-text" className={cn(`text-xl`, className)} />
);

export const DocumentMarkdownIcon = ({ className }: Props): JSX.Element => (
  <Icon icon="ant-design:file-markdown-outlined" className={cn(`text-xl`, className)} />
);
//
export const RenameIcon = ({ className }: Props): JSX.Element => (
  <Icon icon="mingcute:text-line" className={cn(`text-xl`, className)} />
);

export const DeleteIcon = ({ className }: Props): JSX.Element => (
  <Icon icon="solar:trash-bin-2-outline" className={cn(`text-xl`, className)} />
);

export const OpenNewTab = ({ className }: Props): JSX.Element => (
  <Icon icon="fluent:window-new-16-regular" className={cn(`text-xl`, className)} />
);

export const LoadingIcon = ({ className }: Props): JSX.Element => (
  <Icon icon="line-md:loading-twotone-loop" className={cn(`text-xl`, className)} />
);
