import type { TypedMessage, NonSerializableTypedMessage } from '../base.js'
import { createIsType } from '../utils/internal.js'

export interface PendingPromise<T> extends Promise<T> {
    status: 'pending'
}
export interface FulfilledPromise<T> extends Promise<T> {
    readonly status: 'fulfilled'
    readonly value: T
}
export interface RejectedPromise<T> extends Promise<T> {
    readonly status: 'rejected'
    readonly reason: any
}
export type StatusExposedPromise<T> = PendingPromise<T> | FulfilledPromise<T> | RejectedPromise<T>
export interface TypedMessagePromise<T extends TypedMessage = TypedMessage> extends NonSerializableTypedMessage {
    readonly type: 'promise'
    readonly promise: StatusExposedPromise<T>
    readonly meta?: undefined
    /** What to display when the message is not ready. */
    readonly alt?: TypedMessage
}

export const isTypedMessagePromise = createIsType<TypedMessagePromise>('promise')

export function makeTypedMessagePromise<T extends TypedMessage = TypedMessage>(
    promise: Promise<T>,
    alt?: TypedMessage,
): TypedMessagePromise<T> {
    const x: TypedMessagePromise<T> = {
        type: 'promise',
        serializable: false,
        promise: getPromiseWithStatus(promise),
        alt,
        meta: undefined,
    }
    return x
}
const seen = new WeakMap<Promise<any>, StatusExposedPromise<any>>()
function getPromiseWithStatus<T>(promise: Promise<T>): StatusExposedPromise<T> {
    // let's assume it already handle the status update
    if ('status' in promise) return promise as StatusExposedPromise<T>
    if (seen.has(promise)) return seen.get(promise)!
    const _ = Promise.resolve(promise) as StatusExposedPromise<T>
    Object.defineProperty(_, 'status', { configurable: true, value: 'pending' })
    _.then(
        (value) => {
            Object.defineProperties(_, {
                status: { value: 'fulfilled' },
                value: { value },
            })
        },
        (error) => {
            Object.defineProperties(_, {
                status: { value: 'rejected' },
                reason: { value: error },
            })
        },
    )
    seen.set(promise, _)
    return _
}
