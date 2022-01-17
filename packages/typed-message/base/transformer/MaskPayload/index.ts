import type { TypedMessage } from '../../base'
import { isTypedMessageText, isTypedMessageTuple } from '../../core'
import { isTypedMessageAnchor, isTypedMessageMaskPayload, makeTypedMessageAnchor } from '../../extension'
import { visitEachTypedMessageChild } from '../../visitor'
import type { TransformationContext } from '../context'

export interface MaskPayloadTransformOptions {
    /**
     * Text that always before the Mask Payload. This transform will remove them.
     *
     * ```
     * This message is encrypted by @Mask. _link here_
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * ```
     *
     * This part can be removed by providing the strings into this option.
     */
    removePrefixText: string[]
    /**
     * Text that always after the Mask Payload. This transform will remove them.
     *
     * ```
     * _link here_ Install to decrypt!
     *             ~~~~~~~~~~~~~~~~~~~~
     * ```
     *
     * This part can be removed by providing the strings into this option.
     */
    removePostfixText: string[]
    /**
     * An example:
     *
     * TypedMessagePromise (alt = TypedMessageText("decrypting...")) resolves to
     * TypedMessagePromise (alt = TypedMessageText("waiting key on gun")) resolves to
     * TypedMessageMaskPayload (message = TypedMessageText("hey this is an encrypted message!"))
     */
    decrypt(payloadLike: string): TypedMessage
    decryptImage(payloadLike: string): TypedMessage
}
export function createMaskPayloadTransform() {
    return function MaskPayloadTransform(message: TypedMessage, context: TransformationContext) {
        // We don't transform nested message

        // When a false positive payload detected,
        // if we return the result in TypedMessageText (or if we also transform TypedMessageMaskPayload)
        // we will detect the payload again and cause an infinite retry.
        if (isTypedMessageMaskPayload(message)) return message

        // Note: there maybe more than 1 payload in the message. Make sure both of them are handled.
        if (isTypedMessageAnchor(message)) {
            if (message.content.match(linkPayload)) {
                return makeTypedMessageAnchor('normal', 'https://mask.io/', 'Mask Network')
            }
        } else if (isTypedMessageText(message)) {
            // Not detect link form here. Only detect raw form (used on FB) in this branch.
            if (message.content.match(linkPayload)) {
                return makeTypedMessageAnchor('normal', 'https://mask.io/', 'This is a Mask Payload~')
            }
        } else if (isTypedMessageTuple(message)) {
            // Visit each child here, when a raw form or link form is detected,
            // we should check if the before/after is the text need to be elimiated.
            // For example:
            // Tuple(
            //      Text("Keep this text! This post is encrypted by")
            //      Anchor("@mask.io"),
            //      Text(" . Install to decrypt!"),
            //      Anchor(payload here),
            //      Text(" more text to be removed! But keep this one!")
            // )
            // it should be transformed into
            // Tuple(
            //      Text("Keep this text! "),
            //      MaskPayload(pending...),
            //      Text(" But keep this one!"),
            // )
        }
        return visitEachTypedMessageChild(message, MaskPayloadTransform, context)
    }
}
// match the link version payload
const linkPayload = /^https?:\/\/mask(\.io|book\.com)\/\?postdata_v/i
// match the text version payload
const shouldReplace2 = /(\u{1F3BC}[\w+/=|]+:\|\|)/giu
