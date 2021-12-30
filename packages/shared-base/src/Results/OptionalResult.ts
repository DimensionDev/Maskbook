import { Result, Option, Ok, None, Some } from 'ts-results'
import type { CheckedError } from './CheckedError'
export type OptionalResult<T, E> = Result<Option<T>, CheckedError<E>>
export const OptionalResult = {
    Some<T>(x: T): OptionalResult<T, any> {
        return Ok(Some(x))
    },
    None: Ok(None) as OptionalResult<any, any>,
    fromResult<T, E>(x: Result<T, CheckedError<E>>): OptionalResult<T, E> {
        if (x.err) return x
        return Ok(Some(x.val))
    },
}
