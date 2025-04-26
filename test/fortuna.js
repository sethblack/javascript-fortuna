/*
 * index.js: Tests Fortuna-based PRNG
 *
 * (C) 2017 Seth Black
 *
 */

const assert = require('assert');
const fortuna = require('../lib/fortuna');

describe('Fortuna', () => {
  it('should init and set itself to a same state', () => {
    fortuna.init();

    assert.equal(fortuna.counter, 0);
  });

  it('should have a functioning time-based entropy function', () => {
    const entropyVal = fortuna.timeBasedEntropyFxn();

    assert(entropyVal !== null);
  });

  it('should just work', () => {
    fortuna.init();
    const encrypted = fortuna.generate();

    assert(encrypted !== null);
  });

  it('should have time based entropy', (done) => {
    // without this (initialized = false), the test will fail,
    // because previous instance of fortuna will be used
    // and timeBasedEntropy option will be ignored
    fortuna.initialized = false;
    fortuna.init({ timeBasedEntropy: true, accumulateTimeout: 10 });
    const firstEntropyVal = fortuna.entropy;

    const encrypted = fortuna.generate();

    assert(encrypted !== null);

    setTimeout(() => {
      const secondEntropyVal = fortuna.entropy;
      assert(firstEntropyVal !== secondEntropyVal);
      fortuna.stopTimer(); // stop the timer to prevent it from running again
      done();
    }, 25);
  });

  it('should generate a real [0,1]', () => {
    fortuna.init();
    const rval = fortuna.random();

    assert(rval >= 0);
    assert(rval <= 1);
  });
});