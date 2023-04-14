import { type Option, None, Some } from 'ts-results-es'
import { Identifier } from './base.js'
import { banSlash } from './utils.js'

const instance = new WeakSet()
const id: Record<string, Record<string, ProfileIdentifier>> = Object.create(null)
const unknownText = 'person:localhost/$unknown'
/**
 * Refers to a profile on a network.
 */
export class ProfileIdentifier extends Identifier {
    static override from(input: string | null | undefined): Option<ProfileIdentifier> {
        input = String(input)
        if (input === unknownText) return None
        if (input.startsWith('person:')) return Identifier.from(input) as Option<ProfileIdentifier>
        return None
    }
    static of(network: string | undefined | null, userID: string | undefined | null): Option<ProfileIdentifier> {
        if (!userID || !network) return None
        if (network === 'localhost' && userID === '$unknown') return None
        if (network.includes('/') || userID.includes('/')) return None
        if (network.includes('\n') || userID.includes('\n')) return None
        return Some(new ProfileIdentifier(network, userID))
    }

    // ! "network" and "userId" cannot be renamed because they're stored in the database in it's object form.
    declare readonly network: string
    declare readonly userId: string
    private constructor(network: string, userID: string) {
        network = String(network).toLowerCase()
        userID = String(userID)

        if (network === 'localhost' && userID === '$unknown') {
            throw new TypeError('[@masknet/base] Use null instead.')
        }
        if (!userID) throw new TypeError('[@masknet/base] userID cannot be empty.')

        const networkCache = (id[network] ??= {})
        // return the cache to keep the object identity
        // eslint-disable-next-line no-constructor-return
        if (networkCache[userID]) return networkCache[userID]

        banSlash(network, 'ProfileIdentifier.network')
        banSlash(userID, 'ProfileIdentifier.userID')
        super()
        this.network = network
        this.userId = userID
        Object.freeze(this)
        networkCache[userID] = this
        instance.add(this)
    }
    toText() {
        return `person:${this.network}/${this.userId}`
    }
    declare [Symbol.toStringTag]: string
    static [Symbol.hasInstance](x: any): boolean {
        return instance.has(x)
    }
}
ProfileIdentifier.prototype[Symbol.toStringTag] = 'ProfileIdentifier'
Object.freeze(ProfileIdentifier.prototype)
Object.freeze(ProfileIdentifier)
