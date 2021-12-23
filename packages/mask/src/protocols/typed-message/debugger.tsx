// @ts-ignore
const React = require('jsx-jsonml-devtools-renderer') as any
import {
    TypedMessage,
    TypedMessageTuple,
    TypedMessageImage,
    TypedMessageText,
    isTypedMessageTuple,
    isTypedMessageText,
    isTypedMessageImage,
} from '@masknet/shared-base'

class TypedMessageFormatter {
    isTypedMessage(obj: unknown): obj is TypedMessage {
        if (typeof obj !== 'object' || obj === null) return false
        if (!('version' in obj)) return false
        if (!('meta' in obj)) return false
        if (!('type' in obj)) return false
        return true
    }
    hasBody(obj: unknown) {
        if (!this.isTypedMessage(obj)) return false
        if (obj.type === 'empty') return false
        return true
    }
    compound(obj: TypedMessageTuple) {
        return (
            <div style={{ maxWidth: '95vw', overflow: 'break-word' }}>
                <ol>
                    {obj.items.map((x, i) => (
                        <li key={i}>{display(x)}</li>
                    ))}
                </ol>
            </div>
        )
    }
    fields(obj: TypedMessage) {
        return (
            <table>
                <tr style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
                    <td style={{ minWidth: '4em' }}>Field</td>
                    <td>Value</td>
                </tr>
                {Object.keys(obj)
                    .filter((x) => x !== 'type' && x !== 'meta' && x !== 'version')
                    .map((x, i) => (
                        <tr key={i}>
                            <td>{x}</td>
                            {display((obj as any)[x])}
                        </tr>
                    ))}
            </table>
        )
    }
    text(obj: TypedMessageText) {
        return <code style={{ paddingLeft: '2em', opacity: 0.8 }}>{obj.content}</code>
    }
    image(obj: TypedMessageImage) {
        if (typeof obj.image === 'string')
            return <img src={obj.image} height={(obj.height || 600) / 10} width={(obj.width || 400) / 10} />
        return this.fields(obj)
    }
    body(obj: TypedMessage) {
        if (isTypedMessageTuple(obj)) return this.compound(obj)
        if (isTypedMessageText(obj)) return this.text(obj)
        if (isTypedMessageImage(obj)) return this.image(obj)
        return this.fields(obj)
    }
    header(obj: unknown) {
        if (!this.isTypedMessage(obj)) return null
        return (
            <div>
                TypedMessage({obj.type}) {(obj.meta?.size || 0) > 0 ? <>(with meta {display(obj.meta)})</> : ''}
            </div>
        )
    }
}
export function enhanceTypedMessageDebugger() {
    React.installCustomObjectFormatter(new TypedMessageFormatter())
}
function display(obj: unknown) {
    switch (typeof obj) {
        case 'string':
            return obj
        default:
            // @ts-ignore
            return <object object={obj} />
    }
}
