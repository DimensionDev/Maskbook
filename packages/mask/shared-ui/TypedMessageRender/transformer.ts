import {
    composeTransformers,
    FlattenTypedMessage,
    isTypedMessageAnchor,
    isTypedMessageText,
    makeTypedMessageAnchor,
    makeTypedMessageText,
    makeTypedMessageTuple,
    ParseLinkTransformer,
    type TypedMessage,
    visitEachTypedMessageChild,
    unstable_STYLE_META,
} from '@masknet/typed-message'

enum Order {
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
 * parsed_message
 * |> flatten
 * |> parse links and tags (@user, #tag, $NAME)
 * |> Mask Payload parser (installed in Site Adaptor starts)
 * |> plugins
 */
export const TypedMessageTransformers = composeTransformers()
export const TypedMessagePluginTransformers = composeTransformers()
TypedMessageTransformers.addTransformer(FlattenTypedMessage, Order.Flatten)
TypedMessageTransformers.addTransformer(ParseLinkTransformer, Order.ParseLink)
TypedMessageTransformers.addTransformer(TypedMessagePluginTransformers.subscription, Order.Plugins)

// We will use MaskPayload transformer to replace it in the future PR.
const matcher = /^https?:\/\/mask(\.io|book\.com)/i
const textPayloadChar = /([\w+/=|:])/iu
const emoji = '\u{1F3BC}'
TypedMessageTransformers.addTransformer(function visitor(message, context) {
    if (isTypedMessageAnchor(message)) {
        if (message.href && (matcher.test(message.href) || matcher.test(message.content))) {
            return makeTypedMessageAnchor('normal', 'https://mask.io', 'Mask')
        }
    }

    if (fbStyleTextPayloadReplace && isTypedMessageText(message) && message.content.includes(emoji)) {
        const result: TypedMessage[] = []

        const startFrom = message.content.indexOf(emoji)
        if (startFrom !== 0) result.push(makeTypedMessageText(message.content.slice(0, startFrom)))

        const pendingChar: string[] = []

        let index = startFrom
        while (index < message.content.length) {
            const char = message.content[index]
            if (char === '\uD83C') {
                if (pendingChar.length) {
                    result.push(makeTypedMessageText(pendingChar.join('')))
                    pendingChar.length = 0
                }

                index += 2 // unicode pair
                // here we at the start of the payload char,
                // then we should drop rest chars until it no longer matches the RegExp or we met ":||".
                while (message.content[index].match(textPayloadChar)) {
                    index += 1
                    if (
                        message.content[index] === ':' &&
                        message.content[index + 1] === '|' &&
                        message.content[index + 2] === '|'
                    ) {
                        index += 3
                        break
                    }
                }
                // here we at the end of the payload char
                result.push(
                    makeTypedMessageTuple(
                        [
                            makeTypedMessageText(' ( \u{1F510} '),
                            makeTypedMessageAnchor('normal', 'https://mask.io', 'Mask.io'),
                            makeTypedMessageText(') '),
                        ],
                        new Map([[unstable_STYLE_META, { opacity: 0.5 }]]),
                    ),
                )
            } else {
                pendingChar.push(char)
                index += 1
            }
        }
        return makeTypedMessageTuple(result, message.meta)
    }
    return visitEachTypedMessageChild(message, visitor, context)
}, Order.PayloadReplacer)
let fbStyleTextPayloadReplace = false
export function enableFbStyleTextPayloadReplace() {
    fbStyleTextPayloadReplace = true
}
