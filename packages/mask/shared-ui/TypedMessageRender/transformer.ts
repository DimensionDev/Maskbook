import { composeTransformer, FlattenTypedMessage, ParseLinkTransformer } from '@masknet/typed-message/dom'

export enum Order {
    Flatten = 1000,
    ParseLink = 900,
    MaskPayload = 800,
    Plugins = 500,
}
/**
 * Message transformation order:
 *
 * sns_parsed_message
 * |> flatten
 * |> parse links and tags (@user, #tag, $NAME)
 * |> TODO: Mask Payload parser
 * |> plugins
 */
export const TypedMessageTransformers = composeTransformer()
TypedMessageTransformers.addTransformer(FlattenTypedMessage, Order.Flatten)
TypedMessageTransformers.addTransformer(ParseLinkTransformer, Order.ParseLink)

export const TypedMessagePluginTransformers = composeTransformer()
TypedMessageTransformers.addTransformer(TypedMessagePluginTransformers.subscription, Order.Plugins)
