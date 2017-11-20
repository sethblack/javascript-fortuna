/*
 * fortuna.js: Fortuna-based PRNG
 *
 * (C) 2017 Seth Black
 *
 */

const sha512 = require('js-sha512');
const nodeCryptoJS = require('node-cryptojs-aes');

const CryptoJS = nodeCryptoJS.CryptoJS;

const fortuna = exports;

fortuna.initialized = false;

fortuna.init = (options = {}) => {
  if (fortuna.initialized === true) {
    return;
  }

  fortuna.key = null;
  fortuna.entropy = null;
  fortuna.counter = 0;
  fortuna.entropySz = 128;
  fortuna.currentTimer = null;

  fortuna.timeBasedEntropy = options.timeBasedEntropy || false;
  fortuna.accumulateTimeout = options.accumulateTimeout || 375;

  fortuna.entropyFxn = options.entropyFxn || fortuna.timeBasedEntropyFxn;

  const entropyTestValue = fortuna.entropyFxn();

  if (Array.isArray(entropyTestValue) && entropyTestValue.length !== fortuna.entropySz) {
    throw new fortuna.EntropyException(`entropyFxn did not return an array of length ${fortuna.entropySz}.`);
  } else if (typeof entropyTestValue === 'string' && entropyTestValue.length !== fortuna.entropySz) {
    throw new fortuna.EntropyException(`entropyFxn did not return a string of length ${fortuna.entropySz}.`);
  } else if (typeof entropyTestValue !== 'string' && Array.isArray(entropyTestValue) === false) {
    throw new fortuna.EntropyException(`entropyFxn needs to return either a string or array of length ${fortuna.entropySz} but you gave me ${typeof entropyTestValue} of length ${entropyTestValue.length}.`);
  }

  fortuna.accumulate();
  fortuna.seed();

  fortuna.initialized = true;
};

fortuna.EntropyException = function EntropyException(message) {
  this.message = message;
  this.name = 'EntropyException';
};

fortuna.ConversionException = function ConversionException(message) {
  this.message = message;
  this.name = 'ConversionException';
};

fortuna.timeBasedEntropyFxn = () => sha512(`${(new Date()).getTime()}`);

fortuna.accumulate = () => {
  fortuna.entropy = fortuna.entropyFxn();

  if (fortuna.timeBasedEntropy === true) {
    fortuna.currentTimer = setTimeout(fortuna.accumulate, fortuna.accumulateTimeout);
  }
};

fortuna.stopTimer = () => {
  fortuna.timeBasedEntropy = false;

  if (fortuna.currentTimer !== null) {
    clearTimeout(fortuna.currentTimer);
  }
}

fortuna.seed = () => {
  let seed = '';

  if (Array.isArray(fortuna.entropy)) {
    for (let i = 0; i < fortuna.entropy.length; i += 1) {
      seed += `${fortuna.entropy[i]}`;
    }
  } else {
    seed = fortuna.entropy;
  }

  fortuna.key = sha512(`${seed}${fortuna.count}`);
};

fortuna.generate = () => {
  const str = `${fortuna.count}`;

  const encrypted = CryptoJS.AES.encrypt(str, fortuna.key.toString('base64'), { format: {
    stringify: cipherParams => cipherParams.ciphertext.toString(),
    parse: inStr => inStr,
  } });

  fortuna.count += 1;

  if (fortuna.timeBasedAccumulate === false) {
    fortuna.accumulate();
  }

  fortuna.seed();

  const hexValue = encrypted.toString().substring(0, 8);

  return parseInt(hexValue, 16);
};

fortuna.int32 = () => {
  return fortuna.generate() | 0;
};

fortuna.uint32 = () => {
  return fortuna.generate() >>> 0;
};

fortuna.int53 = () => {
  const high = fortuna.generate() | 0;
  const low = fortuna.generate() >>> 0;
  return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
};

fortuna.int53Full = () => {
  while (true) {
    const high = fortuna.generate() | 0;
    if (high & 0x400000) {
      if ((high & 0x7fffff) === 0x400000 && (fortuna.generate() | 0) === 0) {
        return 0x20000000000000;
      }
    } else {
      const low = fortuna.generate() >>> 0;
      return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
    }
  }
};

fortuna.uint53 = () => {
  const high = fortuna.generate() & 0x1fffff;
  const low = fortuna.generate() >>> 0;
  return (high * 0x100000000) + low;
};

fortuna.uint53Full = () => {
  while (true) {
    const high = fortuna.generate() | 0;
    if (high & 0x200000) {
      if ((high & 0x3fffff) === 0x200000 && (fortuna.generate() | 0) === 0) {
        return 0x20000000000000;
      }
    } else {
      const low = fortuna.generate() >>> 0;
      return ((high & 0x1fffff) * 0x100000000) + low;
    }
  }
};

fortuna.random = () => {
  return fortuna.uint53Full() / 0x20000000000000;
};

if (typeof window !== 'undefined') {
  window.fortuna = fortuna;
}
