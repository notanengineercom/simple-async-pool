namespace UtilityTypes {
  type SimplifyFunctionArgument<T extends unknown[]> = T[0] extends ReadonlyArray<unknown> ? T[0] : [T[0]]
  export type Unfold<T extends unknown[]> = T extends (
    [AsyncIterableIterator<infer A>] | [IterableIterator<infer A>] | [() => Generator<infer A>] | [() => AsyncGenerator<infer A>]
  ) ? [A] : SimplifyFunctionArgument<T>
}

type SharedIterator<TReturnType> = IterableIterator<Promise<TReturnType | typeof ConvertedAsyncIterator['asyncIteratorDone']>>

const resolveIterator = async <TReturnType>(it: AsyncIterableIterator<TReturnType>): Promise<void> => {
  for await (const _ of it) { /* */ }
}

// oxlint-disable-next-line typescript/explicit-module-boundary-types
const isIterator = <T>(maybeIterator: any): maybeIterator is (IterableIterator<T> | AsyncIterableIterator<T>) => typeof maybeIterator?.next === 'function'

class ConvertedAsyncIterator<TValues> {
  private _reachedEnd: boolean = false

  static asyncIteratorDone = Symbol('asyncIterator:done')
  static isAsyncIteratorDone = function (value: unknown): value is symbol {
    return value === ConvertedAsyncIterator.asyncIteratorDone
  }
  constructor(private _asyncIterator: AsyncIterableIterator<TValues>) { }

  public *[Symbol.iterator](): Generator<Promise<IteratorResult<TValues, unknown>>> {
    while (!this._reachedEnd) yield this._asyncIterator.next()
  }

  public endReached(): typeof ConvertedAsyncIterator.asyncIteratorDone {
    this._reachedEnd = true
    return ConvertedAsyncIterator.asyncIteratorDone
  }
}

class NoOpMap<K, V> extends Map<K, V> {
  set(): this { return this }
}

export { UtilityTypes, SharedIterator, ConvertedAsyncIterator, resolveIterator, isIterator, NoOpMap }
