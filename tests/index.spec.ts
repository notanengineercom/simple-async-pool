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
      const generator = function* () {
        yield 10
        yield 25
        yield 50
      }

      const values = await pool(consumerFunction, generator())
      expect(values).to.deep.equal([100, 40, 20])
    })

    it('should run with a concurrency of 1 and return an array of values in the order of the input (async generator)', async () => {
      const generator = async function* () {
        yield 10
        yield 25
        yield 50
      }

      const values = await pool(consumerFunction, generator())
      expect(values).to.deep.equal([100, 40, 20])
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

  describe('Misc', () => {
    it('should accept functions with more than one input', async () => {
      const consumer = async (a: number, b: string) => b.repeat(a)
      const values = await pool(consumer, [1, 'simple'], [2, 'async'], [3, 'pool'])

      expect(values).to.deep.equal(['simple', 'asyncasync', 'poolpoolpool'])
    })
  })
})
