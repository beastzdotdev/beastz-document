import { Socket } from 'socket.io-client';
import { constants } from '@/lib/constants';
import { ChangeSet, EditorView, ViewPlugin, ViewUpdate, Compartment } from '@uiw/react-codemirror';

export const PeerPlugin = (socket: Socket, sharedUniqueHash: string) => {
  return ViewPlugin.fromClass(
    class {
      constructor(private view: EditorView) {
        socket.on(constants.socket.events.PullDoc, (data: unknown) => {
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
          sharedUniqueHash,
        };

        socket.emit(constants.socket.events.PushDoc, data);
      }

      destroy() {
        // remove socket listeners for document edit
        [constants.socket.events.PullDoc, constants.socket.events.PushDoc].forEach(socketEvent => {
          socket.off(socketEvent);
        });
      }
    },
  );
};

export const peerExtensionCompartment = new Compartment();
