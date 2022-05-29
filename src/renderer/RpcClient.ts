import { Client as WebSocket } from 'rpc-websockets';

const rpcClient = new WebSocket('ws://localhost:59853');

export default rpcClient;
