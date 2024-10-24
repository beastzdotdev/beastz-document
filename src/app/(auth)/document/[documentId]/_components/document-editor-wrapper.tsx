'use client';

import { useDocumentsStore } from '@/app/(auth)/(root)/home/state';
import { useCountdown } from '@/hooks/use-countdown';
import { uploadDocumentImagePreviewPath } from '@/lib/api/definitions';
import { ReactChildren } from '@/lib/types';
import { domToImage, sleep } from '@/lib/utils';
import { readAndCompressImage } from '@misskey-dev/browser-image-resizer';
import { useParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export const DocumentEditorWrapper = (props: ReactChildren) => {
  const documentStore = useDocumentsStore();
  const params = useParams<{ documentId: string }>();

  const uploadDomImagePreview = useCallback(async () => {
    const node = document.querySelector('.cm-custom');
    console.log('='.repeat(20));
    console.log(node);

    if (!node) {
      return;
    }

    try {
      console.log('start processs');

      const imgBlob = await domToImage(node as HTMLElement, {
        height: 1000, // max size
      });

      const resized = await readAndCompressImage(imgBlob, {
        scaleRatio: 1,
        debug: false,
        maxHeight: 600,
        maxWidth: 550,
        quality: 1,
        mimeType: 'image/jpeg',
        argorithm: 'bilinear',
      });

      uploadDocumentImagePreviewPath(parseInt(params.documentId), resized).then(res => {
        const { data, error } = res;

        if (error || !data) {
          return;
        }

        documentStore.updateDoc(parseInt(params.documentId), { documentImagePreviewPath: data });
      });
    } catch (error) {
      console.error(error);
      console.log('Something went wrong uploading img');
    }
  }, [documentStore, params.documentId]);

  useEffect(
    () => {
      // wait for 500ms for codemirror to finish rendering
      sleep(500).then(() => uploadDomImagePreview());

      return () => {
        uploadDomImagePreview();
      };
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { restartTimer: _1, time: _2 } = useCountdown({
    defaultTime: 3,
    infinite: true,
    onFinish: () => uploadDomImagePreview(),
  });

  return (
    <div className="h-full flex justify-center">
      {/* <div className="absolute top-0 left-10 p-2 z-10">
        <Button
          className="text-sm cursor-pointer flex flex-col rounded-sm"
          onClick={async () => {
            const node = document.querySelector('.cm-custom');
            console.log('='.repeat(20));
            console.log(node);

            if (!node) {
              return;
            }

            const imgBlob = await domToImage(node as HTMLElement, {
              height: 1000, // max size
            });

            const resized = await readAndCompressImage(imgBlob, {
              scaleRatio: 1,
              debug: true,
              maxHeight: 600,
              maxWidth: 550,
              quality: 1,
              mimeType: 'image/jpeg',
              argorithm: 'bilinear',
            });

            console.log('='.repeat(20));
            console.log(parseInt(params.documentId));

            const { data: url, error } = await uploadDocumentImagePreviewPath(
              parseInt(params.documentId),
              resized,
            );

            // update in local db
          }}
        >
          Test out dom to image
        </Button>
        <Button
          className="text-sm cursor-pointer flex flex-col rounded-sm"
          onClick={async () => uploadDomImagePreview()}
        >
          Test
        </Button>
        <Button
          className="text-sm cursor-pointer flex flex-col rounded-sm"
          onClick={() => restartTimer()}
        >
          restartTimer
        </Button>
        <hr />
        timer : {time}
      </div> */}

      {props.children}
    </div>
  );
};
