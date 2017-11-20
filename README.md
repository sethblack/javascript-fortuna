# javascript-fortuna

Javascript implementation of the Fortuna PRNG. 

## Installation

`npm i javascript-fortuna`

## Basic Usage

This is a quick out-of-the-box usage example. This is not how you'd use it in production if you want it to be secure, but it will give you a decent random number.

```javascript
const fortuna = require('javascript-fortuna');

fortuna.init();
const randomNumber = fortuna.random();

console.log(`I picked ${randomNumber}!`);
```

## Command-line Usage

Javascript Fortuna comes with a simple command-line app that will generate a single random number seeded by your local environment.

```shell
$ js-fortuna
0.7947502068732222
```

## Advanced Usage

To reduce predictability add entropy from dynamic sytem state inforation such as CPU usage, number of active processes, availalbe ram and disk io.

```javascript
const fortuna = require('javascript-fortuna');
const si = require('systeminformation');
const sha512 = require('js-sha512');

function entropyAccumFunction() {
  return new Promise(async (resolve) => {
    const cpuSpeed = await si.cpu();
    const processes = await si.processes();
    const disksIO = await si.disksIO();
    const memory = await si.mem();

    jsspg.entropyVal = sha512(`${JSON.stringify(cpuSpeed)}:${JSON.stringify(processes)}:${JSON.stringify(disksIO)}:${JSON.stringify(memory)}`);

    console.log(`ent: ${jsspg.entropyVal}`);

    resolve();
  });
}

function entropyFunction() {
  return jsspg.entropyVal;
}

let entropyInterval = setInterval(async () => {
  await entropyAccumFunction();
}, 250);

jsspg.initialized = true;

fortuna.init({ timeBasedEntropy: true, accumulateTimeout: 100, entropyFxn: entropyFunction });

const num1 = fortuna.random();
console.log(`I picked ${num1}!`);

setTimeout(() => {
  const num1 = fortuna.random();
  console.log(`I picked ${num1}!`);
  fortuna.stopTimer();
  clearInterval(entropyInterval);
}, 5000);
```

# Building for Browsers

This will generate a ./build/fortuna.min.js file for use in a web browser.

```shell
$ npm run webpack
```

## Basic Browser Usage

```javascript
<script src="js/fortuna.min.js"></script>
<script>
(function () {
  fortuna.init();

  var randomNumber = fortuna.random()
  alert('I picked ' + randomNumber + '!');
})();
</script>
```

# Core Concept

Fortuna is a method of generating random numbers using AES encryption and an environment-based seed. It is more secure than simply using Math.random().

## API

### `fortuna.init(options)`

#### Options [{ k: v }]

- entropyFxn [function fxn()]: Custom entropy function. Must return an Array or string of length fortuna.entropySz (128 by default)
- timeBasedEntropy [bool]: Detaches the reseeding of the algorithm from the call to random().
- accumulateTimeout [int]: The amount of time in milliseconds between each timeBasedEntropy call. Requires timeBasedEntropy to be true.

### `fortuna.random()`

Generates a random floating point value (0,1).

If you need an integer between min and max you can simply

```javascript
const min = 4;
const max = 10;
const randomInt = parseInt((fortuna.random() * (max - min)) + min);
```
