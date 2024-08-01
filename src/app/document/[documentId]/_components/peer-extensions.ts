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
} from '@uiw/react-codemirror';

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
    socket.emit('pushUpdates', version, JSON.stringify(updates));

    socket.once('pushUpdateResponse', function (status: boolean) {
      resolve(status);
    });
  });
};

const pullUpdates = async (socket: Socket, version: number): Promise<readonly Update[]> => {
  return new Promise(function (resolve) {
    socket.emit('pullUpdates', version);

    socket.once('pullUpdateResponse', function (updates: any) {
      resolve(JSON.parse(updates));
    });
  }).then((updates: any) =>
    updates.map((u: any) => ({
      changes: ChangeSet.fromJSON(u.changes),
      clientID: u.clientID,
    }))
  );
};

const peerExtensionPlugin = (socket: Socket) => {
  return ViewPlugin.fromClass(
    class {
      private pushing = false;
      private done = false;

      constructor(private view: EditorView) {
        this.pull();
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.transactions.length) this.push();
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) return;
        this.pushing = true;
        const version = getSyncedVersion(this.view.state);
        const success = await pushUpdates(socket, version, updates);
        this.pushing = false;
        // Regardless of whether the push failed or new updates came in
        // while it was running, try again if there's updates remaining
        if (sendableUpdates(this.view.state).length) setTimeout(() => this.push(), 100);
      }

      async pull() {
        while (!this.done) {
          console.log('This should happen only once' + Math.random());

          const version = getSyncedVersion(this.view.state);
          const updates = await pullUpdates(socket, version);

          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() {
        this.done = true;
      }
    }
  );
};

export const peerExtensionCompartment = new Compartment();
export const peerExtension = (socket: Socket, startVersion: number) => {
  const ext = [collab({ startVersion }), peerExtensionPlugin(socket)];
  return peerExtensionCompartment.of(ext);
};
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