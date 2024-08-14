import { Socket } from 'socket.io-client';
import {
  Update,
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from '@codemirror/collab';
import {
  ChangeSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  Text,
  Compartment,
  Extension,
} from '@uiw/react-codemirror';
import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import { useDocStore } from '@/app/(auth)/document/[documentId]/_components/document-editor';

const pushUpdates = (
  socket: Socket,
  version: number,
  fullUpdates: readonly Update[]
): Promise<boolean> => {
  // Strip off transaction data
  const updates = fullUpdates.map(u => ({
    clientID: u.clientID,
    changes: u.changes.toJSON(),
    effects: u.effects,
  }));

  return new Promise(function (resolve) {
    socket.emit('pushUpdates', { version, updates });
    socket.once('pushUpdateResponse', (status: boolean) => resolve(status));
  });
};

const pullUpdates = async (socket: Socket, version: number): Promise<readonly Update[]> => {
  return new Promise(function (resolve) {
    socket.emit('pullUpdates', version);
    socket.once('pullUpdateResponse', (updates: any) => resolve(updates));
  }).then((updates: any) => {
    console.log('='.repeat(20) + 'xxxxs');
    console.log(updates);

    return updates.map((u: any) => ({
      changes: ChangeSet.fromJSON(u.changes),
      clientID: u.clientID,
    }));
  });
};

export const peerExtension = (socket: Socket, startVersion: number) => {
  const plugin = ViewPlugin.fromClass(
    class {
      private pushing = false;
      private done = false;

      constructor(private view: EditorView) {
        console.log('init peer ext');

        this.pull();
      }

      update(update: ViewUpdate) {
        // console.log('='.repeat(20));
        // console.log(update.transactions.length);

        if (update.docChanged) {
          console.log(update);
          this.push();
        }

        // if (update.docChanged || update.transactions.length) console.log(update);
        // if (update.docChanged || update.transactions.length) this.push();
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        console.log('='.repeat(20));
        console.log(updates);

        if (this.pushing || !updates.length) {
          return;
        }

        // console.log('SENDABLE UPDATES');
        // console.log('socket connected', docEditSocket.connected);
        // console.log(updates);

        this.pushing = true;
        const version = getSyncedVersion(this.view.state);
        // useDocStore.getState().setVersion(version);

        await pushUpdates(socket, version, updates);
        this.pushing = false;

        // Regardless of whether the push failed or new updates came in
        // while it was running, try again if there's updates remaining
        // if (sendableUpdates(this.view.state).length) setTimeout(() => this.push(), 1000);
      }

      async pull() {
        while (!this.done) {
          console.log('executing pull');

          const version = getSyncedVersion(this.view.state);
          // useDocStore.getState().setVersion(version);

          const updates = await pullUpdates(socket, version);

          console.log('='.repeat(20));
          console.log(version);
          console.log(updates);

          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() {
        console.log('destroy peer ext');

        this.done = true;
      }
    }
  );

  return [collab({ startVersion }), plugin];
};

export const peerExtensionCompartment = new Compartment();

export const getDocument = (socket: Socket): Promise<{ version: number; doc: Text }> =>
  new Promise(resolve => {
    socket.emit('getDocument');
    socket.once('getDocumentResponse', function (version: number, doc: string) {
      resolve({
        version,
        doc: Text.of(doc.split('\n')),
      });
    });
  });
