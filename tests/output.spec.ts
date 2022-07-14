import 'mocha'
import { expect } from 'chai'
import { Substitute } from '@fluffy-spoon/substitute'

import { createOutputIterator } from '../src/output'
import { createWorkers } from '../src/worker'
import { SharedIterator } from '../src/utilities'

describe('Create output iterator', () => {

  it('should create an iterator that correctly yields values and ends', async () => {
    const input = Substitute.for<SharedIterator<string>>()
    input.next().returns(
      { value: Promise.resolve('simple') },
      { value: Promise.resolve('async') },
      { value: Promise.resolve('pool') },
      { value: undefined, done: true },
      { value: undefined, done: true }
    )

    const workers = createWorkers(2, input, new Map())
    const iterator = createOutputIterator(workers)

    const values = []
    for await (const value of iterator) values.push(value)

    expect(values).to.deep.equal(['simple', 'async', 'pool'])
  })

})
