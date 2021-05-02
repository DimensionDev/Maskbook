/**
 * The basic structure that contains
 */
export interface TypedMessage {
    /**
     * The metadata this message contains.
     * Not expected to display to normal users.
     *
     * It will be serialized to a JSON object.
     */
    readonly meta?: ReadonlyMap<string, unknown>
    /**
     * The type of this message.
     *
     * Custom message must starts with 'x-' (means extension).
     */
    readonly type: string
}
export type SerializableTypedMessages = SerializableTypedMessage<number> | NonSerializableWithToJSONTypedMessage
/**
 * A TypedMessage which can be serialized safely into a JSON.
 * If it containing a inner message, it must be serializable too.
 */
export interface SerializableTypedMessage<Version extends number> extends TypedMessage {
    readonly serializable: true
    /** Since it is serializable, it must be version controlled. */
    readonly version: Version
}
/**
 * A TypedMessage that is _not_ serializable but it provides a fallback which _is_ serializable.
 */
export interface NonSerializableWithToJSONTypedMessage extends TypedMessage {
    readonly serializable: false
    readonly toJSON: SerializableTypedMessages
}
/**
 * A TypedMessage is _not_ serializable (not prepared or not intended to be).
 */
export interface NonSerializableTypedMessage extends TypedMessage {
    readonly serializable: false
}
