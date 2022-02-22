import {
    composeTransformers,
    FlattenTypedMessage,
    isTypedMessageAnchor,
    makeTypedMessageAnchor,
    ParseLinkTransformer,
    visitEachTypedMessageChild,
} from '@masknet/typed-message'

export enum Order {
    Flatten = 1000,
    ParseLink = 900,
    // MaskPayload = 800,
    /** @deprecated */
    PayloadReplacer = 700,
    Plugins = 500,
}
/**
 * Message transformation order:
 *
 * sns_parsed_message
 * |> flatten
 * |> parse links and tags (@user, #tag, $NAME)
 * |> Mask Payload parser (installed in SNS Adaptor starts)
 * |> plugins
 */
export const TypedMessageTransformers = composeTransformers()
export const TypedMessagePluginTransformers = composeTransformers()
TypedMessageTransformers.addTransformer(FlattenTypedMessage, Order.Flatten)
TypedMessageTransformers.addTransformer(ParseLinkTransformer, Order.ParseLink)
TypedMessageTransformers.addTransformer(TypedMessagePluginTransformers.subscription, Order.Plugins)

// We will use MaskPayload transformer to replace it in the future PR.
const matcher = /^https?:\/\/mask(\.io|book\.com)/i
TypedMessageTransformers.addTransformer(function visitor(message, context) {
    if (
        isTypedMessageAnchor(message) &&
        message.href &&
        (matcher.test(message.href) || matcher.test(message.content))
    ) {
        return makeTypedMessageAnchor('normal', 'https://mask.io', 'Mask')
    }
    return visitEachTypedMessageChild(message, visitor, context)
}, Order.PayloadReplacer)
