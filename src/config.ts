import { createConnection } from 'typeorm';
import { Ip } from './entities/IP';
import path from 'path';

export const typeOrmConfig = {
  type: 'sqlite',
  database: path.resolve(__dirname, '../ipstore.sqlite'),
  entities: [Ip],
  logging: process.env.NODE_ENV !== 'production',
  synchronize: true,
} as Parameters<typeof createConnection>[0];
