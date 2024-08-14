import { GlobalModalType } from '@/app/(auth)/_components/global-modal';

export type BusMessageType = string | number | JSX.Element;

export type BusEvents = {
  'open:file-modal': () => void;
  'open:settings': () => void;
  'editor:select-all': () => void;
  'editor:copy': () => void;

  'socket:connected': () => void;
  'socket:reconnecting': () => void;
  'socket:disconnected': () => void;

  'open:global-model': (params: {
    type: GlobalModalType;
    title: string;
    message: string;
    onClose?: () => void;
  }) => void;
};
