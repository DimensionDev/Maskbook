import { type Result, type Option, Ok, None, Some } from 'ts-results-es'
import type { CheckedError } from './CheckedError.js'
export type OptionalResult<T, E> = Result<Option<T>, CheckedError<E>>
export const OptionalResult = {
    Some<T>(x: T): OptionalResult<T, any> {
        return Ok(Some(x))
    },
    None: Ok(None) as OptionalResult<any, any>,
    fromResult<T, E>(x: Result<T, CheckedError<E>>): OptionalResult<T, E> {
        if (x.isErr()) return x
        return Ok(Some(x.value))
    },
}
