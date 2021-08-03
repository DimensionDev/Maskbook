import { Result, Option, Ok, None, Some } from 'ts-results'
import { Exception, ExceptionKinds } from './Exception'
export * from './Exception'
export type DecodeExceptions = ExceptionKinds.DecodeFailed | ExceptionKinds.InvalidPayload
export type OptionalResult<T, E extends ExceptionKinds> = Result<Option<T>, Exception<E>>
export const OptionalResult = {
    Some<T>(x: T): OptionalResult<T, any> {
        return Ok(Some(x))
    },
    None: Ok(None) as OptionalResult<any, any>,
    Err<E extends ExceptionKinds>(reason: E, cause: unknown) {
        return new Exception(reason, cause).toErr()
    },
}
