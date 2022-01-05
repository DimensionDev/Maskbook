import {
    isTypedMessagePromise,
    isTypedMessageText,
    isTypedMessageTuple,
    makeTypedMessageEmpty,
    makeTypedMessageText,
    makeTypedMessageTuple,
    TypedMessage,
} from '..'
export function flattenTypedMessage(x: TypedMessage): TypedMessage {
    // Promise are always dropped after resolve even it has meta.
    if (isTypedMessagePromise(x) && x.value) return flattenTypedMessage(x.value)
    if (isTypedMessageTuple(x)) {
        if (x.meta) return x
        if (x.items.length === 0) return makeTypedMessageEmpty()
        if (x.items.length === 1) return flattenTypedMessage(x.items[0])
        const nextItem = x.items
            .map(flattenTypedMessage)
            .flatMap((x) => (isTypedMessageTuple(x) && !x.meta ? x.items : x))
            .reduce<TypedMessage[]>((prev, current) => {
                const lastItem = prev.at(-1)
                if (!lastItem || lastItem.meta || current.meta) return prev.concat(current)
                if (!isTypedMessageText(current) || !isTypedMessageText(lastItem)) return prev.concat(current)
                // Only concat when last one and current one are both text and have no meta.
                prev.pop()
                prev.push(makeTypedMessageText(`${lastItem.content} ${current.content}`))
                return prev
            }, [])
        if (nextItem.length === 1) return nextItem[0]
        return makeTypedMessageTuple(nextItem)
    }
    return x
}
