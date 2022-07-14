
namespace UtilityTypes {
  export type SimplifyFunctionArgument<T extends unknown[]> = T[0] extends ReadonlyArray<unknown> ? T[0] : [T[0]]
  export type Unfold<T extends unknown[]> = T extends (
    [AsyncIterableIterator<infer A>] | [IterableIterator<infer A>] | [() => Generator<infer A>] | [() => AsyncGenerator<infer A>]
  ) ? [A] : SimplifyFunctionArgument<T>
}

type SharedIterator<TReturnType> = IterableIterator<Promise<TReturnType | typeof ConvertedAsyncIterator['asyncIteratorDone']>>

const resolveIterator = async <TReturnType>(it: AsyncIterableIterator<TReturnType>): Promise<void> => {
  while (true) {
    const itr = await it.next()
    if (itr.done) break
  }
}

const isIterator = <T>(maybeIterator: any): maybeIterator is (IterableIterator<T> | AsyncIterableIterator<T>) => typeof maybeIterator?.next === 'function'

class ConvertedAsyncIterator<TValues> {
  private _reachedEnd: boolean = false

  static asyncIteratorDone = Symbol('asyncIterator:done')
  static isAsyncIteratorDone = function (value: any): value is symbol {
    return value === ConvertedAsyncIterator.asyncIteratorDone
  }
  constructor(private _asyncIterator: AsyncIterableIterator<TValues>) { }

  public *[Symbol.iterator]() {
    while (!this._reachedEnd) yield this._asyncIterator.next()
  }

  public endReached() {
    this._reachedEnd = true
    return ConvertedAsyncIterator.asyncIteratorDone
  }
}

class NoOpMap<K, V> extends Map<K, V> {
  set() { return this }
}

export { UtilityTypes, SharedIterator, ConvertedAsyncIterator, resolveIterator, isIterator, NoOpMap }
