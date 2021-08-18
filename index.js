import express from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JSONFile, Low } from 'lowdb';
import { fileURLToPath } from 'url';
import geoip from 'geoip-lite';
import { format } from 'date-fns';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const main = async () => {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // set up LowDB
  const adapter = new JSONFile(path.join(__dirname, 'db.json'));
  const db = new Low(adapter);

  // read from db
  await db.read();
  db.data = db.data || [];

  app.get('/', async (req, res) => {
    // get user ip address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const location = geoip.lookup(ip);

    // store ip address to db
    const data = {
      id: uuidv4(),
      date: format(new Date(), 'dd.MM.y kk:mm:ss'),
      ip,
      timezone: location ? location.timezone : undefined,
    };

    // add data to db
    db.data.push(data);
    await db.write();

    return res.render('index', { data: db.data.reverse() || [], ip });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`App running on port ${PORT}`));
};

main().catch((error) => console.log('main function error', error));
