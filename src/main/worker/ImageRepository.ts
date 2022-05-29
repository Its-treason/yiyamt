import { Server as RpcServer } from 'rpc-websockets';

export default class ImageRepository {
  private static instance: ImageRepository;

  private images: { [key: string]: Buffer } = {};

  private constructor(private rpcServer: RpcServer) {}

  public static init(rpcServer: RpcServer) {
    ImageRepository.instance = new ImageRepository(rpcServer);
    rpcServer.event('image-created');
  }

  public static getInstance(): ImageRepository {
    if (!ImageRepository.instance) {
      throw new Error('ImageRepository not yet initialised');
    }

    return ImageRepository.instance;
  }

  public set(hash: string, buffer: Buffer): void {
    // If the image is already set no need to set it again
    if (this.images[hash]) {
      return;
    }

    this.images[hash] = buffer;

    this.rpcServer.emit('image-created', { hash, buffer });
  }

  public get(hash: string): Buffer | null {
    return this.images[hash] || null;
  }
}
