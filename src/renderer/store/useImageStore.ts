import create from 'zustand';
import filetype from 'magic-bytes.js';
import rpcClient from '../RpcClient';

type Image = {
  hash: string;
  buffer: Uint8Array;
  imageString: string;
};

type State = {
  images: Image[];
};

const useImageStore = create<State>(() => ({
  images: [],
}));

type ImageCreatedArgs = {
  hash: string;
  buffer: { data: number[] };
};

rpcClient.on('open', () => {
  rpcClient.subscribe('image-created');
  rpcClient.on('image-created', (args) => {
    const { hash, buffer } = args as ImageCreatedArgs;

    const imageBuffer = Uint8Array.from(buffer.data);

    const type = filetype(imageBuffer);
    const imgData = btoa(
      imageBuffer.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const imageString = `data:${type[0].mime};base64,${imgData}`;

    useImageStore.setState((state) => {
      state.images.push({ hash, buffer: imageBuffer, imageString });
      return state;
    });
  });
});

export default useImageStore;
