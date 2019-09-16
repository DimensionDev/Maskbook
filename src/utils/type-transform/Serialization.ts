import { Serialization } from '@holoflows/kit'
import { declarePersistable, deserialize, serialize } from 'serialijse'

export function serializable(name: string) {
    return <T>(constructor: T) => {
        declarePersistable(constructor, name)
        Object.defineProperty(constructor, 'name', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: name,
        })
        return constructor
    }
}
serializable('Error')(Error)
serializable('TypeError')(TypeError)
serializable('ReferenceError')(ReferenceError)
serializable('SyntaxError')(SyntaxError)
serializable('URIError')(URIError)

export default {
    async serialization(from) {
        return serialize(from)
    },
    async deserialization(to: string) {
        try {
            return deserialize(to)
        } catch {
            return {}
        }
    },
} as Serialization
