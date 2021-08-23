import mongoose from 'mongoose';

const ipSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: [true, 'Ip is required'],
  },
  timezone: String,
  country: String,
  region: String,
  city: String,
  latitude: Number,
  longitude: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const IP = mongoose.model('IP', ipSchema, 'ips');

export default IP;
