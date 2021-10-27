import { Result, Option, Ok, None, Some } from 'ts-results'
import type { EKindsError, EKinds } from './Exception'
export * from './Exception'
export type DecodeExceptions = EKinds.DecodeFailed | EKinds.InvalidPayload
export type OptionalResult<T, E extends EKinds> = Result<Option<T>, EKindsError<E>>
export const OptionalResult = {
    Some<T>(x: T): OptionalResult<T, any> {
        return Ok(Some(x))
    },
    None: Ok(None) as OptionalResult<any, any>,
    fromResult<T, E extends EKinds>(x: Result<T, EKindsError<E>>): OptionalResult<T, E> {
        if (x.err) return x
        return Ok(Some(x.val))
    },
}
