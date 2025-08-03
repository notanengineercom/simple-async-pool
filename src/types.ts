import type { UtilityTypes } from './utilities'

type TFunction<TFunctionArgs extends unknown[], TReturnType> = (...args: UtilityTypes.Unfold<TFunctionArgs>) => Promise<TReturnType>

export type { TFunction }
