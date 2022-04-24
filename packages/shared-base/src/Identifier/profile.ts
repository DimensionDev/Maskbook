import { isObject } from 'lodash-unified'
import { type Option, None } from 'ts-results'
import { EnhanceableSite } from '../Site/type'
import { banSlash, Identifier } from './base'

const id: Record<string, Record<string, ProfileIdentifier>> = Object.create(null)
/**
 * Refers to a profile on a network.
 */
export class ProfileIdentifier extends Identifier {
    /** @deprecated Avoid using it */
    static unknownToText = 'person:localhost/$unknown'
    static override from(x: string): Option<ProfileIdentifier> {
        x = String(x)
        if (x === this.unknownToText) return None
        if (x.startsWith('person:')) return Identifier.from(x) as Option<ProfileIdentifier>
        return None
    }
    static of(network: string | undefined | null, userID: string | undefined | null) {
        if (!userID || !network) return null
        if (network === EnhanceableSite.Localhost && userID === '$unknown') return null
        return new ProfileIdentifier(network, userID)
    }

    // ! "network" and "userId" cannot be renamed because they're stored in the database in it's object form.
    declare readonly network: string
    declare readonly userId: string
    private constructor(network: string, userID: string) {
        if (network === EnhanceableSite.Localhost && userID === '$unknown') {
            throw new TypeError('[@masknet/shared-base] Please use null instead.')
        }

        network = String(network)
        userID = String(userID)
        if (!userID) throw new TypeError('[@masknet/shared-base] userID cannot be empty.')

        const networkCache = (id[network] ??= {})
        if (networkCache[userID]) return networkCache[userID]

        banSlash(network)
        banSlash(userID)
        super()
        this.network = network
        this.userId = userID
        Object.freeze(this)
        networkCache[userID] = this
        this.#fin = true
    }
    toText() {
        return `person:${this.network}/${this.userId}`
    }
    declare [Symbol.toStringTag]: string
    #fin!: boolean
    static [Symbol.hasInstance](x: unknown): boolean {
        return isObject(x) && #fin in x && x.#fin
    }
}
ProfileIdentifier.prototype[Symbol.toStringTag] = 'ProfileIdentifier'
Object.freeze(ProfileIdentifier.prototype)
Object.freeze(ProfileIdentifier)
