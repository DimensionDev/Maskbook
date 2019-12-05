/// <reference path="../../env.d.ts" />
import { Serialization } from '@holoflows/kit'
import Typeson from 'typeson'

export function serializable(name: string) {
    return <T extends NewableFunction>(constructor: T) => {
        Object.defineProperty(constructor, 'name', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: name,
        })
        typeson.register({ [name]: constructor })
        return constructor
    }
}

const typeson = new Typeson().register([require('typeson-registry/dist/presets/builtin')])
typeson.register({})
// To register this type in the typeson
require('../../database/IdentifierMap')

export default {
    async serialization(from) {
        return typeson.encapsulate(from)
    },
    async deserialization(to: string) {
        try {
            return typeson.revive(to)
        } catch (e) {
            console.error(e)
            return {}
        }
    },
} as Serialization
