# javascript-fortuna

Javascript implementation of the Fortuna PRNG. 

## Installation

`npm i javascript-fortuna`

## Basic Usage

This is a quick out-of-the-box usage example. This is not how you'd use it in production if you want it to be secure, but it will give you a decent random number.

```javascript
const fortuna = require('fortuna');

fortuna.init();
const randomNumber = fortuna.random();

console.log(`I picked ${randomNumber}!`);
```

## Advanced Usage

To reduce predictability add entropy from dynamic sytem state inforation such as CPU usage, number of active processes, availalbe ram and disk io.

```javascript
const fortuna = require('fortuna');
const si = require('systeminformation');
const sha512 = require('js-sha512');

async function entropyFunction() {
  const cpuSpeed = await si.cpu();
  const processes = await si.processes();
  const disksIO = await si.disksIO();
  const memory = await si.mem();

  return sha512(`${JSON.stringify(cpuSpeed)}:${JSON.stringify(processes)}:${JSON.stringify(disksIO)}:${JSON.stringify(memory)}`);
}

fortuna.init({ timeBasedEntropy: true, accumulateTimeout: 100, entropyFxn: entropyFunction });

const num1 = fortuna.random();
console.log(`I picked ${num1}!`);

setTimeout(() => {
  const num2 = fortuna.random();
  console.log(`I picked ${num2}!`);
}, 250);
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
const randomInt = parseInt((fortuna.random() * (max - min)) + min)
```
