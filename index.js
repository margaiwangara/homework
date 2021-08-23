import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import geoip from 'geoip-lite';
import ipRouter from './routes/ip.js';
import { connectDB } from './models/index.js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '.env') });
const main = async () => {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  await connectDB();

  app.use('/', ipRouter);

  // grab errors
  app.use(function (req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
  });

  app.use(function (error, req, res, next) {
    return res.status(error.status || 500).json({
      message: error.message || 'Oops! Something went wrong',
    });
  });

  const PORT = process.env.PORT || 5200; // port
  app.listen(PORT, () => console.log(`App running on port ${PORT}`));
};

main().catch((error) => console.log('main function error', error));
