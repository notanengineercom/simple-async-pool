import { ConvertedAsyncIterator } from './utilities'

function isAsyncIterator<T>(maybeIterator: any): maybeIterator is AsyncIterableIterator<T> {
  return typeof maybeIterator[Symbol.asyncIterator] === 'function'
}

const getYieldFactory = <
  TFunctionArgs extends unknown[],
  TReturnType extends unknown,
  TValues extends (TFunctionArgs[0] | TFunctionArgs),
  TPromiseReturnType extends Promise<TReturnType>
>(fnc: (...args: TFunctionArgs) => TPromiseReturnType) =>
  (currentValues: TValues) => {
    const functionArguments = Array.isArray(currentValues) ? currentValues : [currentValues]
    return fnc(...functionArguments as TFunctionArgs)
  }

const createInputIterator = function* <
  TFunctionArgs extends unknown[],
  TReturnType extends unknown,
  TValues extends (TFunctionArgs[0] | TFunctionArgs),
  TPromiseReturnType extends Promise<TReturnType>
>(
  fnc: (...args: TFunctionArgs) => TPromiseReturnType,
  values: TValues[] | IterableIterator<TValues> | AsyncIterableIterator<TValues>
) {
  const getYield = getYieldFactory(fnc)
  const iterator = isAsyncIterator(values) ?
    new ConvertedAsyncIterator(values) :
    values

  if (!(iterator instanceof ConvertedAsyncIterator)) {
    for (const result of iterator) yield getYield(result)
    return
  }
  for (const result of iterator)
    yield result.then<symbol | TPromiseReturnType>(({ done, value }) => done ? iterator.endReached() : getYield(value))
}

export { createInputIterator }
