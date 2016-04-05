'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');

const Bitcore = require('bitcore-lib');
const ecies = require('bitcore-ecies');
const Message = require('bitcore-message');
const _ = require('lodash').mixin(require('lodash-keyarrange'));
const keys = {
  payment: new Bitcore.PrivateKey(config.keys.payment)
};

const Report = new Schema({
  requestID: {type: String, required: true, unique: true},
  pubkey: {type: String, required: true},
  storage: {
    free: { type: Number, required: true },
    used: { type: Number, required: true }
  },
  bandwidth: {
    upload: { type: Number, required: true },
    download: { type: Number, required: true }
  },
  contact: {
    protocol: { type: String, required: true },
    nodeID: { type: String, required: true },
    address: { type: String, required: true },
    port: { type: Number, required: true }
  },
  timestamp: { type: Date, required: true, expires: '90d' },
  payment: { type: String, required: true },
  signature: { type: String, required: true }
});

Report.pre('save', function decryptReport(cb) {
  const pubkey = this.pubkey;
  const signature = this.signature;
  const report = this.toObject();
  report.timestamp = report.timestamp.valueOf();
  delete report.requestID;
  delete report._id;
  delete report.__v;
  delete report.signature;

  // verify signature
  try {
    const addr = Bitcore.Address.fromPublicKeyHash(new Buffer(report.contact.nodeID, 'hex'));
    const sorted = _.keyArrangeDeep(report);
    const verified = new Message(JSON.stringify(sorted)).verify(addr, signature);
    if (!verified) {
      throw new Error('Could not verify signature');
    }
  } catch (e) {
    return cb(e);
  }

  // verify that payment info can be decrypted
  try {
    const clientPubKey = Bitcore.PublicKey.fromString(pubkey);
    const decryptor = ecies().privateKey(keys.payment).publicKey(clientPubKey);
    decryptor.decrypt(new Buffer(report.payment, 'base64')); // just attempt to decrypt it, don't save it decrypted
  } catch (e) {
    return cb(e);
  }
  return cb();
});

module.exports = mongoose.model('Report', Report);