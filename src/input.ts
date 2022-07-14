import { types } from 'util'
import { ConvertedAsyncIterator, isIterator, UtilityTypes } from './utilities'
import { TFunction } from './types'

type TInputArguments<TValue> = TValue[] | [IterableIterator<TValue>] | [AsyncIterableIterator<TValue>]

const isAsyncIterator = <T>(maybeIterator: any): maybeIterator is AsyncIterableIterator<T> => typeof maybeIterator[Symbol.asyncIterator] === 'function'

const getYieldFactory = <
  TInput extends TInputArguments<unknown>, TReturnType
>(fnc: TFunction<TInput, TReturnType>) =>
  (currentValues: TInput | TInput[0]) => {
    const functionArguments = Array.isArray(currentValues) ? currentValues : [currentValues]
    return fnc(...functionArguments as UtilityTypes.Unfold<TInput>)
  }

const getInput = <TInput extends TInputArguments<unknown>>(rawInput: TInput): IterableIterator<unknown> | AsyncIterableIterator<unknown> | TInput => {
  const [firstInput] = rawInput
  if (types.isGeneratorFunction(firstInput)) return firstInput()
  if (types.isGeneratorObject(firstInput) || isIterator(firstInput)) return firstInput
  return rawInput
}

const createInputIterator = function* <TInput extends TInputArguments<unknown>, TReturnType>(
  consumerFunction: TFunction<TInput, TReturnType>,
  rawInputValues: TInput
) {
  const getYield = getYieldFactory(consumerFunction)
  const values = getInput(rawInputValues)

  if (!isAsyncIterator(values)) {
    for (const result of values) yield getYield(result)
    return
  }

  const iterator = new ConvertedAsyncIterator(values)
  for (const result of iterator) yield result.then<symbol | Promise<TReturnType>>(({ done, value }) => done ? iterator.endReached() : getYield(value))

}

export { TInputArguments, createInputIterator }
