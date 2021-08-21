const express = require('express');
const path = require('path');
const geoip = require('geoip-lite');
const DataStore = require('nedb');
const { formatToTimeZone } = require('date-fns-timezone');

class Server {
  app;
  PORT;
  db;
  geo;
  defTimezone;

  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 5020;
    this.defTimezone = 'America/New_York';
    this.connectDB();
    this.configuration();
    this.routes();
  }

  // configure server
  configuration() {
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'ejs');
  }

  connectDB() {
    this.db = new DataStore({
      filename: path.resolve(__dirname, 'ipdb.db'),
      autoload: true,
    });
  }

  routes() {
    this.app.get('/', async (req, res) => {
      try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        this.geo = geoip.lookup(ip);

        // store ip address to db
        const data = {
          date: formatToTimeZone(new Date(), 'DD.MM.YYYY HH:mm:ss', {
            timeZone: this.getGeo('timezone') || this.defTimezone,
          }),
          ip,
          timezone: this.getGeo('timezone'),
          region: this.getGeo('region'),
          city: this.getGeo('city'),
          country: this.getGeo('country'),
          position: this.getGeo('ll'),
        };

        const newEntry = await this.storeData(data);
        const allEntries = await this.getData();
        const count = await this.countData();

        return res.render('index', { ip, data: allEntries, count });
        // req.render('index');
      } catch (error) {
        console.log('error', error);
        return res.json({
          message: 'Oops! Something went wrong',
        });
      }
    });
  }

  getGeo(key) {
    if (this.geo && this.geo[key]) {
      return this.geo[key];
    }

    return null;
  }

  storeData(data) {
    return new Promise((resolve, reject) => {
      return this.db.insert(data, (error, result) => {
        resolve(result);

        if (error) {
          reject(error);
        }
      });
    });
  }

  getData() {
    return new Promise((resolve, reject) => {
      return this.db
        .find({})
        .sort({ date: -1 })
        .exec((error, docs) => {
          if (error) {
            reject(error);
          }

          resolve(docs);
        });
    });
  }

  countData() {
    return new Promise((resolve, reject) => {
      return this.db.count({}, (error, count) => {
        resolve(count);

        if (error) {
          reject(error);
        }
      });
    });
  }

  start() {
    this.app.listen(this.PORT, () => {
      console.log(
        `App running in ${process.env.NODE_ENV} mode on port ${this.PORT}`,
      );
    });
  }
}

const server = new Server();
server.start();
