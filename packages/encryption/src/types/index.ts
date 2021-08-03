import { Result, Option, Ok, None, Some } from 'ts-results'
import type { Exception, ExceptionKinds } from './Exception'
export * from './Exception'
export type DecodeExceptions = ExceptionKinds.DecodeFailed | ExceptionKinds.InvalidPayload
export type OptionalResult<T, E extends ExceptionKinds> = Result<Option<T>, Exception<E>>
export const OptionalResult = {
    Some<T>(x: T): OptionalResult<T, any> {
        return Ok(Some(x))
    },
    None: Ok(None) as OptionalResult<any, any>,
    fromResult<T, E extends ExceptionKinds>(x: Result<T, Exception<E>>): OptionalResult<T, E> {
        if (x.err) return x
        return Ok(Some(x.val))
    },
}
