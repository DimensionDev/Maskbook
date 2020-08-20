import { TypedMessage, isTypedMessageText, isTypedMessageCompound } from './types'
import { Result, Ok, Err } from 'ts-results'
/**
 * Get inner text from a TypedMessage
 * @param message message
 */
export function extractTextFromTypedMessage(message: TypedMessage | null): Result<string, void> {
    if (message === null) return Err.EMPTY
    if (isTypedMessageText(message)) return new Ok(message.content)
    if (isTypedMessageCompound(message))
        return new Ok(
            message.items.map(extractTextFromTypedMessage).filter((x) => x.ok && x.val.length > 0)[0].val as string,
        )
    return Err.EMPTY
}
