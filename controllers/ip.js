import { IP } from '../models/index.js';
import geoip from 'geoip-lite';
import { formatToTimeZone } from 'date-fns-timezone';

const DEFAULT_TIMEZONE = 'America/New_York';

export async function handleIps(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const location = geoip.lookup(ip);

    let data = { ip, timezone: DEFAULT_TIMEZONE };

    if (location) {
      data = {
        ...data,
        timezone: location.timezone,
        city: location.city,
        country: location.country,
        region: location.region,
        latitude: location.ll[0],
        longitude: location.ll[1],
      };
    }

    // persist to db
    const newIP = await IP.create(data);

    // get from db
    const ips = await IP.find({}).sort('-createdAt');

    // modify date display
    const modifiedIps = ips.map((value, index) => ({
      ...value.toObject(),
      createdAt: formatToTimeZone(value.createdAt, 'DD.MM.YYYY HH:mm:ss', {
        timeZone: value.timezone,
      }),
    }));

    return res.render('index', { data: modifiedIps, ip });
  } catch (error) {
    next(error);
  }
}
