import type { TFunction } from './types'

interface PoolOptions {
  output?: 'AsyncIterator' | 'Promise'
  concurrency?: number
}
type DecideOnPoolOptions<T, P> = P extends PoolOptions ? P['output'] extends 'AsyncIterator' ? AsyncIterableIterator<T> : Promise<T[]> : Promise<T[]>

const isPoolOptions = (value: unknown): value is PoolOptions => typeof value === 'object'
const getPoolOptions = (poolOptions?: PoolOptions | TFunction<any[], unknown>): Required<PoolOptions> => {
  const pp = isPoolOptions(poolOptions) ? poolOptions : undefined
  const defaultPoolOptions: Required<PoolOptions> = { output: 'Promise', concurrency: 1 }
  return { ...defaultPoolOptions, ...pp }
}

export { PoolOptions, DecideOnPoolOptions, isPoolOptions, getPoolOptions }
