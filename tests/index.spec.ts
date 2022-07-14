import 'mocha'
import { expect } from 'chai'

import { promisify } from 'util'

import { pool } from '../src'

describe('Simple async pool', () => {
  const delay = promisify(setTimeout)
  const consumerFunction = async (delta: number) => {
    const reducedValue = 1000 / delta
    await delay(reducedValue)
    return reducedValue
  }

  describe('With default pool options', () => {

    it('should run with a concurrency of 1 and return an array of values in the order of the input (array)', async () => {
      const values = await pool(consumerFunction, 10, 25, 50)
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should run with a concurrency of 1 and return an array of values in the order of the input (iterator)', async () => {
      const input = [10, 25, 50]
      const values = await pool(consumerFunction, input.values())
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should run with a concurrency of 1 and return an array of values in the order of the input (generator)', async () => {
      const generator = function* generator() {
        yield 10
        yield 25
        yield 50
      }

      const values = await pool(consumerFunction, generator())
      const values2 = await pool(consumerFunction, generator)
      expect(values).to.deep.equal([100, 40, 20])
      expect(values2).to.deep.equal([100, 40, 20])
    })

    it('should run with a concurrency of 1 and return an array of values in the order of the input (async generator)', async () => {
      const generator = async function* () {
        yield 10
        yield 25
        yield 50
      }

      const values = await pool(consumerFunction, generator())
      const values2 = await pool(consumerFunction, generator)
      expect(values).to.deep.equal([100, 40, 20])
      expect(values2).to.deep.equal([100, 40, 20])
    })
  })

  describe('With custom concurrency in pool options (lower than input size)', () => {

    it('should return an array of values in the order of the input (array)', async () => {
      const values = await pool({ concurrency: 2 }, consumerFunction, 10, 25, 50)
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should return an array of values in the order of the input (iterator)', async () => {
      const input = [10, 25, 50]
      const values = await pool({ concurrency: 2 }, consumerFunction, input.values())
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should return an array of values in the order of the input (generator)', async () => {
      const generator = function* () {
        yield 10
        yield 25
        yield 50
      }

      const values = await pool({ concurrency: 2 }, consumerFunction, generator())
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should return an array of values in the order of the input (async generator)', async () => {
      const generator = async function* () {
        yield 10
        yield 25
        yield 50
      }

      const values = await pool({ concurrency: 2 }, consumerFunction, generator())
      expect(values).to.deep.equal([100, 40, 20])
    })
  })

  describe('With custom concurrency in pool options (higher than input size)', () => {

    it('should return an array of values in the order of the input (array)', async () => {
      const values = await pool({ concurrency: 4 }, consumerFunction, 10, 25, 50)
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should return an array of values in the order of the input (iterator)', async () => {
      const input = [10, 25, 50]
      const values = await pool({ concurrency: 4 }, consumerFunction, input.values())
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should return an array of values in the order of the input (generator)', async () => {
      const generator = function* () {
        yield 10
        yield 25
        yield 50
      }

      const values = await pool({ concurrency: 4 }, consumerFunction, generator())
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should return an array of values in the order of the input (async generator)', async () => {
      const generator = async function* () {
        yield 10
        yield 25
        yield 50
      }

      const values = await pool({ concurrency: 4 }, consumerFunction, generator())
      expect(values).to.deep.equal([100, 40, 20])
    })
  })

  describe('With "AsyncIterator" output in pool options', () => {

    it('should return an async iterable iterator', () => {
      const iterator = pool({ output: 'AsyncIterator' }, consumerFunction, 10, 25, 50)
      expect(iterator[Symbol.asyncIterator]).to.be.a('function')
    })

    it('should return an async iterable iterator that computes zero elements', async () => {
      const iterator = pool({ output: 'AsyncIterator', concurrency: 2 }, async () => 'no value')
      const values = []
      for await (const value of iterator) values.push(value)
      expect(values).to.be.an('array').of.length(0)
    })

    it('should return an async iterable iterator with zero elements', async () => {
      const emptyArray: number[] = []
      const iterator = pool({ output: 'AsyncIterator', concurrency: 2 }, consumerFunction, ...emptyArray)
      const values: number[] = []
      for await (const value of iterator) values.push(value)
      expect(values).to.be.an('array').of.length(0)
    })

    it('should return an async iterable iterator in the order of resolution (array)', async () => {
      const iterator = pool({ output: 'AsyncIterator', concurrency: 2 }, consumerFunction, 10, 25, 50)

      const values: number[] = []
      for await (const value of iterator) values.push(value)

      expect(values).to.be.an('array').of.length(3)
      expect(values).to.deep.equal([40, 20, 100])
    })

    it('should return an async iterable iterator in the order of resolution (iterator)', async () => {
      const input = [10, 25, 50]
      const iterator = pool({ output: 'AsyncIterator', concurrency: 2 }, consumerFunction, input.values())

      const values: number[] = []
      for await (const value of iterator) values.push(value)

      expect(values).to.be.an('array').of.length(3)
      expect(values).to.deep.equal([40, 20, 100])
    })

    it('should return an array of values in the order of the input (generator)', async () => {
      const generator = function* () {
        yield 10
        yield 25
        yield 50
      }

      const iterator = pool({ output: 'AsyncIterator', concurrency: 2 }, consumerFunction, generator())
      const values = []
      for await (const value of iterator) values.push(value)

      expect(values).to.be.an('array').of.length(3)
      expect(values).to.deep.equal([40, 20, 100])
    })

    it('should return an array of values in the order of the input (async generator)', async () => {
      const generator = async function* () {
        yield 10
        yield 25
        yield 50
      }

      const iterator = pool({ output: 'AsyncIterator', concurrency: 2 }, consumerFunction, generator())

      const values = []
      for await (const value of iterator) values.push(value)

      expect(values).to.be.an('array').of.length(3)
      expect(values).to.deep.equal([40, 20, 100])
    })
  })

  describe('Infer function arguments types from input', () => {

    it('should infer from array', async () => {
      const values = await pool(async value => value.toFixed(2), 10, 25, 50)
      expect(values).to.deep.equal(['10.00', '25.00', '50.00'])
    })

    it('should infer from iterator', async () => {
      const values = await pool(async value => value.toFixed(2), [10, 25, 50].values())
      expect(values).to.deep.equal(['10.00', '25.00', '50.00'])
    })

    it('should infer from generator', async () => {
      const generator = function* () {
        yield 10
        yield 25
        yield 50
      }
      const values = await pool(async value => value.toFixed(2), generator())
      expect(values).to.deep.equal(['10.00', '25.00', '50.00'])
    })

    it('should infer from async generator', async () => {
      const generator = async function* () {
        yield 10
        yield 25
        yield 50
      }
      const values = await pool(async value => value.toFixed(2), generator())
      expect(values).to.deep.equal(['10.00', '25.00', '50.00'])
    })

    it('should infer when providing pool options', async () => {
      const values = await pool({ concurrency: 3 }, async value => value.toFixed(2), 10, 25, 50)
      expect(values).to.deep.equal(['10.00', '25.00', '50.00'])
    })

    it('should infer multiple arguments from input', async () => {
      const values = await pool(
        async (valueNumber, valueString) => valueString.repeat(valueNumber),
        ...[[1, 'simple'], [2, 'async'], [3, 'pool']] as [number, string][]
      )
      expect(values).to.deep.equal(['simple', 'asyncasync', 'poolpoolpool'])
    })
  })

  describe('Misc', () => {
    it('should accept functions with more than one input', async () => {
      const consumer = async (a: number, b: string) => b.repeat(a)
      const values = await pool(consumer, ...[[1, 'simple'], [2, 'async'], [3, 'pool']] as [number, string][])
      expect(values).to.deep.equal(['simple', 'asyncasync', 'poolpoolpool'])
    })

    it('should return an empty array for empty inputs', async () => {
      const emptyArray: number[] = []
      const values = await pool(consumerFunction, ...emptyArray)
      expect(values).to.be.an('array').of.length(0)
    })
  })
})
