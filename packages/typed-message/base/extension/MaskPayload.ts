import type { Meta, TypedMessage } from '../base'
import { createIsType } from '../utils/internal'

/**
 * This TypedMessage represents an encrypted TypedMessage.
 */
export interface TypedMessageMaskPayload extends TypedMessage {
    readonly type: 'x-mask-payload'
    readonly message: TypedMessage
}
export const isTypedMessageMaskPayload = createIsType<TypedMessageMaskPayload>('x-mask-payload')

export function makeTypedMessageMaskPayload(
    message: TypedMessageMaskPayload['message'],
    meta?: Meta,
): TypedMessageMaskPayload {
    return {
        type: 'x-mask-payload',
        message,
        meta,
    }
}
