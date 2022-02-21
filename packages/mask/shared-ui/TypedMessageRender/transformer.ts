import { composeTransformers, FlattenTypedMessage, ParseLinkTransformer } from '@masknet/typed-message'

export enum Order {
    Flatten = 1000,
    ParseLink = 900,
    // MaskPayload = 800,
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
