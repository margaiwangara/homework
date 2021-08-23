import 'reflect-metadata';
import express, { Request, Response } from 'express';
import path from 'path';
import geoip from 'geoip-lite';
import { format } from 'date-fns';
import { typeOrmConfig } from './config';
import { createConnection } from 'typeorm';
import { Ip } from './entities/IP';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const main = async () => {
  // connect to db
  await createConnection(typeOrmConfig);

  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.get('/', async (req: Request, res: Response) => {
    try {
      // get user ip address
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const location = geoip.lookup(ip as string);

      // store ip address to db
      const data = {
        ip: ip as string,
        timezone: location?.timezone,
        city: location?.city,
        country: location?.country,
        coordinates: location?.ll?.toString(),
      };

      await Ip.create(data).save();

      const addresses = await Ip.find({ order: { createdAt: 'DESC' } });

      const modified = addresses.map((v) => ({
        ...v,
        createdAt: format(v.createdAt, 'dd.MM.y kk:mm:ss'),
      }));

      return res.render('index', { ip, data: modified });
    } catch (error) {
      return res.status(500).json(error);
    }
  });

  const PORT = process.env.PORT || 5010;
  app.listen(PORT, () =>
    console.log(`App running in ${process.env.NODE_ENV} mode on port ${PORT}`),
  );
};

main().catch((error) => console.log('main function error', error));
