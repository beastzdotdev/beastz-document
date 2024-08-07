import domtoimage from 'dom-to-image';

//TODO: this is for images of documents in /home
//TODO: image must be collected asynchronously
export const _DOMTOIMAGE = (node: HTMLElement) => {
  console.time('domtoimage');

  domtoimage
    .toJpeg(node!, { height: 400, quality: 1 })
    .then(function (dataUrl: string) {
      var link = document.createElement('a');
      link.download = 'domtoimage.jpeg';
      link.href = dataUrl;
      link.click();
    })
    .catch(function (error: unknown) {
      console.error('oops, something went wrong!', error);
    })
    .finally(() => {
      console.timeEnd('domtoimage');
    });
};
