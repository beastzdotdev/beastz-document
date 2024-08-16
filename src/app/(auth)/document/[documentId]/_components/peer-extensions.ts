import { Socket } from 'socket.io-client';
import {
  ChangeSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  Text,
  Compartment,
} from '@uiw/react-codemirror';

const PeerPluginSocketNames = {
  PushDoc: 'push_doc',
  PullDoc: 'pull_doc',
  FetchDoc: 'fetch_doc',
};

export const PeerPlugin = (userId: number, socket: Socket) => {
  return ViewPlugin.fromClass(
    class {
      constructor(private view: EditorView) {
        socket.on(PeerPluginSocketNames.PullDoc, (data: unknown) => {
          this.view.dispatch({
            scrollIntoView: false,
            changes: ChangeSet.fromJSON(data),
          });
        });
      }

      update(update: ViewUpdate) {
        // docChanged for only user input (this also detect selections, effect, etc)
        // selectionSet is checked for only pushing my own updates and not set by pull
        if (update.docChanged && update.selectionSet) {
          this.push(update);
        }
      }

      async push(update: ViewUpdate) {
        if (!update.changes.length) {
          return;
        }

        const data = {
          changes: update.changes.toJSON(),
          userId,
        };

        socket.emit(PeerPluginSocketNames.PushDoc, data);
      }

      destroy() {
        // remove socket listeners for document edit
        for (const socketEvent of Object.values(PeerPluginSocketNames)) {
          socket.off(socketEvent);
        }
      }
    }
  );
};

export const peerExtensionCompartment = new Compartment();

export const getDocument = (socket: Socket): Promise<Text> => {
  return new Promise(resolve => {
    socket.emit(PeerPluginSocketNames.FetchDoc, null, (e: string) =>
      resolve(Text.of(e.split('\n')))
    );
  });
};
