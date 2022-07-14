import 'mocha'
import { expect } from 'chai'

import { createInputIterator } from '../src/input'

describe('Create input iterator', () => {
  const inputFunction = async (arg: string) => arg

  it('should create an iterator with promises as values (input: array)', async () => {
    const inputValues = ['simple', 'async', 'pool']
    const iterator = createInputIterator(inputFunction, inputValues)

    const values = []
    for (const value of iterator) values.push(await value)

    expect(values).to.deep.equal(inputValues)
  })

  it('should create an iterator with promises as values (input: iterator)', async () => {
    const inputValues = ['simple', 'async', 'pool']
    const iterator = createInputIterator(inputFunction, [inputValues.values()])

    const values = []
    for (const value of iterator) values.push(await value)

    expect(values).to.deep.equal(inputValues)
  })

  it('should create an iterator with promises as values (input: async iterator)', async () => {
    const isNode10 = process.version.startsWith('v10.')
    const symbolExpectation = isNode10 ? 'Symbol(asyncIterator:done)' : 'asyncIterator:done'
    async function* inputValues() {
      yield 'simple'
      yield 'async'
      yield 'pool'
    }
    const iterator = createInputIterator(inputFunction, [inputValues()])

    const values = []
    for (const value of iterator) values.push(await value)
    const valuesWithoutDoneSymbol = values.filter(value => typeof value === 'string')
    const doneSymbol = values[3] as symbol

    expect(valuesWithoutDoneSymbol).to.deep.equal(['simple', 'async', 'pool'])
    expect(doneSymbol).to.be.a('symbol')

    const symbolDescription = isNode10 ? doneSymbol.toString() : doneSymbol.description
    expect(symbolDescription).to.equal(symbolExpectation)
  })

})