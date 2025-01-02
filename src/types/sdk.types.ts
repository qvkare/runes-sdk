import { Logger } from './logger.types';

export interface SdkConfig {
  rpcUrl: string;
  rpcUsername?: string;
  rpcPassword?: string;
  logger?: Logger;
}
