const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
const DataStore = require('nedb');

async function getIP(req, res) {
  try {
    const { db } = req;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const tarih = format(new Date(), 'dd.MM.y kk:mm:ss');

    const giris = {
      id: uuidv4(),
      ip,
      tarih,
    };

    const yeniVeri = await setData(giris, db);
    const veri = await getData(db);

    return res.render('index', { veri, ip });
  } catch (error) {
    return res.json({
      hata: error.message || 'Bir hata oluşturuldu!',
    });
  }
}

const middleware = (req, res, next) => {
  const db = new DataStore({
    filename: path.resolve(__dirname, 'ip_gosterme.db'),
    autoload: true,
  });

  req.db = db;

  next();
};

async function server() {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.get('/', middleware, getIP);

  const PORT = process.env.PORT || 9000;
  app.listen(PORT, () => console.log(`Uygulama port: ${PORT}`));
}

const setData = (giris, db) => {
  return new Promise((resolve, reject) => {
    return db.insert(giris, (error, doc) => {
      if (error) {
        reject(error);
      }

      resolve(doc);
    });
  });
};

const getData = (db) => {
  return new Promise((resolve, reject) => {
    return db
      .find({})
      .sort({ tarih: -1 })
      .exec((error, docs) => {
        if (error) {
          reject(error);
        }

        resolve(docs);
      });
  });
};

server().catch((error) => console.log('Temel Fonksiyon Hatasi', error));
