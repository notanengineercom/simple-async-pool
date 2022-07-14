import { PoolOptions, DecideOnPoolOptions, getPoolOptions, isPoolOptions } from './options'
import { SharedIterator, resolveIterator, NoOpMap } from './utilities'
import { TInputArguments, createInputIterator } from './input'
import { createWorkers } from './worker'
import { createOutputIterator } from './output'
import type { TFunction } from './types'

const parseInputArguments = <TInput extends TInputArguments<unknown>, TReturnType>(
  inputArguments: [PoolOptions, TFunction<TInput, TReturnType>, ...TInput] | [TFunction<TInput, TReturnType>, ...TInput]
): [Required<PoolOptions>, TFunction<TInput, TReturnType>, TInput] => {
  const [consumerFunctionOrOptions, ...restOfInput] = inputArguments
  const poolOptions = getPoolOptions(consumerFunctionOrOptions)
  const consumerFunction = isPoolOptions(consumerFunctionOrOptions) ? restOfInput.shift() as TFunction<TInput, TReturnType> : consumerFunctionOrOptions
  return [poolOptions, consumerFunction, restOfInput as TInput]
}

function pool<TOptions extends PoolOptions, TInput extends TInputArguments<unknown>, TReturnType>(
  options: TOptions, consumerFunction: TFunction<TInput, TReturnType>, ...input: TInput
): DecideOnPoolOptions<TReturnType, TOptions>
function pool<TInput extends TInputArguments<unknown>, TReturnType>(
  consumerFunction: TFunction<TInput, TReturnType>, ...input: TInput
): DecideOnPoolOptions<TReturnType, TFunction<TInput, TReturnType>>
function pool<TOptions extends PoolOptions, TInput extends TInputArguments<unknown>, TReturnType>(
  ...inputArguments: [TOptions, TFunction<TInput, TReturnType>, ...TInput] | [TFunction<TInput, TReturnType>, ...TInput]
): DecideOnPoolOptions<TReturnType, TOptions> {
  const [options, consumerFunction, input] = parseInputArguments(inputArguments)
  const sharedInputIterator = createInputIterator(consumerFunction, input) as SharedIterator<TReturnType>
  const sharedMap = options.output === 'Promise' ?
    new Map<Promise<TReturnType>, TReturnType>() :
    new NoOpMap<Promise<TReturnType>, TReturnType>()
  const workers = createWorkers(options.concurrency, sharedInputIterator, sharedMap)

  const iterator = createOutputIterator(workers)
  return (options.output === 'AsyncIterator' ?
    iterator :
    resolveIterator(iterator).then(() => [...sharedMap.values()])
  ) as DecideOnPoolOptions<TReturnType, TOptions>
}

export { pool, PoolOptions }
