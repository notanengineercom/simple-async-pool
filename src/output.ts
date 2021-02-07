import { Worker, byWorkerId } from './worker'

export const createOutputIterator = async function* <TReturnType>(workers: Worker<TReturnType>[]): AsyncIterableIterator<TReturnType> {
  const runningWorkers = workers.map(worker => worker.run())
  const state = { reachedEndOfIterator: false, runningWorkersCount: runningWorkers.length }

  while (state.runningWorkersCount > 0) {
    const { reachedEnd, result, workerPosition, workerId } = await Promise.race(runningWorkers)
    if (!reachedEnd) yield result as TReturnType
    else state.reachedEndOfIterator = true

    if (!state.reachedEndOfIterator) {
      runningWorkers[workerPosition] = workers[workerPosition].run()
      continue
    }

    const workerIndex = runningWorkers.findIndex(byWorkerId(workerId))
    state.runningWorkersCount -= runningWorkers.splice(workerIndex, 1).length
  }
}
