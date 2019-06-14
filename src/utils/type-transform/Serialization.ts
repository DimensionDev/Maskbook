import { Serialization } from '@holoflows/kit'
import { declarePersistable, deserialize, serialize } from 'serialijse'

export function serializable(name: string) {
    return <T>(constructor: T) => {
        declarePersistable(constructor, name)
        return constructor
    }
}

export default {
    async serialization(from) {
        return serialize(from)
    },
    async deserialization(to: string) {
        return deserialize(to)
    },
} as Serialization
