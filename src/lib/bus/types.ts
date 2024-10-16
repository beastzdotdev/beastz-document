import { GlobalModalType } from '@/app/(auth)/_components/global-modal';

export type BusMessageType = string | number | JSX.Element;

export type BusEvents = {
  'open:file-modal': () => void;
  'open:settings': () => void;

  'document:save-before-share': () => void;
  'document:save-before-share:response': (success: boolean) => void;

  'open:global-model': (params: {
    type: GlobalModalType;
    title: string;
    message: string;
    onClose?: () => void;
  }) => void;

  'menubar:file:share': () => void;
  'menubar:file:download': (type: 'markdown' | 'text') => void;
  'menubar:file:details': () => void;
  'menubar:file:delete': () => void;

  // 'menubar:edit:undo': () => void;
  // 'menubar:edit:redo': () => void;
  'menubar:edit:cut': () => void;
  'menubar:edit:copy': () => void;
  // 'menubar:edit:paste': () => void;
  'menubar:edit:select-all': () => void;
  'menubar:edit:delete': () => void;
  'menubar:edit:find-and-replace': () => void;
  'menubar:edit:tools:word-count': () => void;
};
