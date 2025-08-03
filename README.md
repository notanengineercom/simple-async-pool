# simple-async-pool
[![npm:version](https://flat.badgen.net/npm/license/simple-async-pool?icon=npm)](https://www.npmjs.com/package/simple-async-pool)
[![npm:version](https://flat.badgen.net/npm/v/simple-async-pool?icon=npm)](https://www.npmjs.com/package/simple-async-pool)
[![packagephobia](https://flat.badgen.net/packagephobia/install/simple-async-pool)](https://packagephobia.com/result?p=simple-async-pool)
[![ci](https://flat.badgen.net/github/checks/notanengineercom/simple-async-pool/main?icon=github)](https://github.com/notanengineercom/simple-async-pool/actions)

Easy to use, dependency free and typesafe concurrent pool of async and promise returning functions.

## Installation

```sh
npm i simple-async-pool
```

## Usage
Using the async pool is really simple. The package exposes a `pool` function with the following simplified signature:
```ts
function pool(options: PoolOptions, consumerFunction, ...input)
function pool(consumerFunction, ...input)
```


The `PoolOptions` interface has the following members:
```ts
interface PoolOptions {
  output?: 'AsyncIterator' | 'Promise' // defines the return value of the pool function ('Promise' by default)
  concurrency?: number // defines the number of concurrent workers to spawn (1 by default)
}
```


By default, when no pool options are provided, the pool function returns a promise that resolves the processed input values with a concurrency of one:
```ts
import { pool } from 'simple-async-pool'

const consumerFunction = async (input: string) => input
const processedValues = await pool(consumerFunction, 'simple', 'async', 'pool') // if the input values are not strings, typescript complains due to the type missmatch

console.log(processedValues) // [ 'simple', 'async', 'pool' ]
```

The input values can either be an array (spread syntax), an iterator, an async iterator or a generator function (async/non async).
```ts
const processedValues = await pool(consumerFunction, 'simple', 'async', 'pool')

// ...

const input = ['simple', 'async', 'pool']
const processedValues = await pool(consumerFunction, input.values())

// ...

function* input() {
  yield 'simple'
  yield 'async'
  yield 'pool'
}
const processedValues = await pool(consumerFunction, input())

// ...

async function* input() {
  yield 'simple'
  yield 'async'
  yield 'pool'
}
const processedValues = await pool(consumerFunction, input())

console.log(processedValues) // [ 'simple', 'async', 'pool' ]

// ...

function* input() {
  yield 'simple'
  yield 'async'
  yield 'pool'
}
const processedValues = await pool(consumerFunction, input)

// ...

async function* input() {
  yield 'simple'
  yield 'async'
  yield 'pool'
}
const processedValues = await pool(consumerFunction, input)

console.log(processedValues) // [ 'simple', 'async', 'pool' ]
```

To modify the default behaviour, pool options can be provided as an argument:
```ts
const processedValues = await pool({ concurrency: 3 }, consumerFunction, 'simple', 'async', 'pool')
console.log(processedValues) // [ 'simple', 'async', 'pool' ]
```


Returning an async iterator instead of a promise can be achieved via the pool options too:
```ts
const iterator = pool({ concurrency: 3, output: 'AsyncIterator' }, consumerFunction, 'simple', 'async', 'pool')

const values = []
for await (const value of iterator) values.push(value)
```


When the `output` property in the options is set to `Promise` (default behaviour), the order of the output values is guaranteed.
When it's `AsyncIterator`, values are yielded in the order of resolution, so no order can be guaranteed.


## License

MIT © **Enrique Pöhlmann**
