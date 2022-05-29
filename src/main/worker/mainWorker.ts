import { Server as RpcServer } from 'rpc-websockets';
import { expose } from 'threads';
import saveFilesHandler from './handler/saveFilesHandler';
import openFilesHandler from './handler/openFilesHandler';
import ImageRepository from './ImageRepository';
import uploadImageHandler from './handler/uploadImageHandler';

const rpcServer = new RpcServer({
  port: 59853,
  host: 'localhost',
  maxPayload: 1e7, // 10Mb
});

rpcServer.register('open-files', openFilesHandler);
rpcServer.register('save-files', saveFilesHandler);
rpcServer.register('upload-image', uploadImageHandler);

ImageRepository.init(rpcServer);

expose({});
