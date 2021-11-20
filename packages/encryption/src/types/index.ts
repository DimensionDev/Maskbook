import { Result, Option, Ok, None, Some } from 'ts-results'
import type { EKindsError } from './Exception'
export * from './Exception'
export type OptionalResult<T, E> = Result<Option<T>, EKindsError<E>>
export const OptionalResult = {
    Some<T>(x: T): OptionalResult<T, any> {
        return Ok(Some(x))
    },
    None: Ok(None) as OptionalResult<any, any>,
    fromResult<T, E>(x: Result<T, EKindsError<E>>): OptionalResult<T, E> {
        if (x.err) return x
        return Ok(Some(x.val))
    },
}
