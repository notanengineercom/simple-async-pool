import { PoolOptions, SharedIterator, resolveIterator, isIterator, NoOpMap } from './utilities'
import { createInputIterator } from './input'
import { createWorkers } from './worker'
import { createOutputIterator } from './output'

type SimplifyFunctionArgument<T extends unknown[]> = T['length'] extends 1 ? T[0] : T
type TInput<TValue> = TValue[] | [IterableIterator<TValue>] | [AsyncIterableIterator<TValue>]
type TFunction<TFunctionArgs extends unknown[], TReturnType extends unknown> = (...args: TFunctionArgs) => Promise<TReturnType>
type DecideOnPoolOptions<T, P> = P extends PoolOptions ? P['output'] extends 'AsyncIterator' ? AsyncIterableIterator<T> : Promise<T[]> : Promise<T[]>

function isPoolOptions(value: any): value is PoolOptions {
  return typeof value === 'object'
}

const getPoolOptions = (poolOptions?: PoolOptions): Required<PoolOptions> => {
  const defaultPoolOptions: Required<PoolOptions> = { output: 'Promise', concurrency: 1 }
  return { ...defaultPoolOptions, ...poolOptions }
}

// @ts-expect-error // TODO: find a way to stop getting the overload flagged as error
function pool<
  TFunctionArgs extends unknown[],
  TReturnType extends unknown,
  TOptions extends PoolOptions
>(
  options: TOptions,
  fnc: TFunction<TFunctionArgs, TReturnType>,
  ...input: TInput<SimplifyFunctionArgument<TFunctionArgs>>
): DecideOnPoolOptions<TReturnType, TOptions>

function pool<
  TFunctionArgs extends unknown[],
  TReturnType extends unknown
>(
  fnc: TFunction<TFunctionArgs, TReturnType>,
  ...input: TInput<SimplifyFunctionArgument<TFunctionArgs>>
): DecideOnPoolOptions<TReturnType, TFunction<TFunctionArgs, TReturnType>>

function pool<
  TFunctionArgs extends unknown[],
  TReturnType extends unknown,
  TOptions extends PoolOptions
>(
  fnc: TOptions | TFunction<TFunctionArgs, TReturnType>,
  ...input: [TFunction<TFunctionArgs, TReturnType>, ...TInput<SimplifyFunctionArgument<TFunctionArgs>>] | TInput<SimplifyFunctionArgument<TFunctionArgs>>
): DecideOnPoolOptions<TReturnType, TOptions> {
  const poolOptions = isPoolOptions(fnc) ? getPoolOptions(fnc) : getPoolOptions()
  const consumerFunction = isPoolOptions(fnc) ? input.shift() as TFunction<TFunctionArgs, TReturnType> : fnc
  const inputValues = isIterator(input[0]) ?
    input[0] :
    input as SimplifyFunctionArgument<TFunctionArgs>[]

  const sharedInputIterator = createInputIterator(consumerFunction, inputValues) as SharedIterator<TReturnType>
  const sharedMap = poolOptions.output === 'Promise' ?
    new Map<Promise<TReturnType>, TReturnType>() :
    new NoOpMap<Promise<TReturnType>, TReturnType>()
  const workers = createWorkers(poolOptions.concurrency, sharedInputIterator, sharedMap)

  const iterator = createOutputIterator(workers)
  return (poolOptions.output === 'AsyncIterator' ?
    iterator :
    resolveIterator(iterator).then(() => [...sharedMap.values()])
  ) as DecideOnPoolOptions<TReturnType, TOptions>
}

export { pool, PoolOptions }
