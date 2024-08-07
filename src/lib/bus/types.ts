export type BusMessageType = string | number | JSX.Element;

export type BusEvents = {
  'open:file-modal': () => void;
  'open:settings': () => void;
  'editor:select-all': () => void;
  'editor:copy': () => void;
  'socket:connected': () => void;

  // examples
  // 'show-alert': (params: { message: BusMessageType; onClose?: () => void }) => void;
  // 'show-file': (params: { item: RootFileStructure; isInBin: boolean }) => void;
};
