import { SharedIterator, ConvertedAsyncIterator } from './utilities'

interface Worker<TReturnType> {
  run: () => WorkerPromise<{
    result?: TReturnType
    workerId: symbol
    workerPosition: number
    reachedEnd: boolean
  }>
}

const getWorkerId = Symbol('get:WorkerId')
interface PreWorkerPromise<T> extends Promise<T> { [getWorkerId]?: symbol }
interface WorkerPromise<T> extends Required<PreWorkerPromise<T>> { }

const assignWorkerId = <T>(promise: PreWorkerPromise<T>, workerId: symbol): WorkerPromise<T> => {
  promise[getWorkerId] = workerId
  return promise as WorkerPromise<T>
}

const workerFactory = <TReturnType>(sharedIterator: SharedIterator<TReturnType>, sharedMap: Map<Promise<TReturnType>, TReturnType | null>) => {
  return (workerPosition: number): Worker<TReturnType> => {
    const workerId = Symbol()

    const run = async () => {
      const iteratorResult = sharedIterator.next()
      if (iteratorResult.done) return { workerId, workerPosition, reachedEnd: true }
      const promise = iteratorResult.value as Promise<TReturnType>
      sharedMap.set(promise, null)

      const result = await promise as TReturnType | symbol
      if (ConvertedAsyncIterator.isAsyncIteratorDone(result)) {
        sharedMap.delete(promise)
        return { workerId, workerPosition, reachedEnd: true }
      }
      sharedMap.set(promise, result)
      return { result, workerId, workerPosition, reachedEnd: false }
    }

    return { run: () => assignWorkerId(run(), workerId) }
  }
}

const byWorkerId = (workerId: symbol) => <T>(worker: WorkerPromise<T>) => worker[getWorkerId] === workerId

const createWorkers = <TReturnType>(workersCount: number, sharedIterator: SharedIterator<TReturnType>, sharedMap: Map<Promise<TReturnType>, TReturnType>) => {
  const workerF = workerFactory(sharedIterator, sharedMap)
  return Array.from({ length: workersCount }).map((_, i) => workerF(i))
}

export { Worker, createWorkers, byWorkerId }
