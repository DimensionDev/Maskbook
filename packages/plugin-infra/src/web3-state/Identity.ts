import LRU from 'lru-cache'
import type {
    SocialAddress,
    SocialIdentity,
    IdentityServiceState as Web3SocialIdentityState,
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'

export class IdentityServiceState implements Web3SocialIdentityState {
    protected cache = new LRU<string, Promise<Array<SocialAddress<NetworkPluginID>>>>({
        max: 20,
        ttl: Number.MAX_SAFE_INTEGER,
    })

    private getIdentityID(identity: SocialIdentity) {
        if (!identity.identifier) return ''
        return [identity.identifier.network, identity.identifier.userId, identity.bio, identity.homepage].join('_')
    }

    protected getFromCache(identity: SocialIdentity) {
        return this.cache.get(this.getIdentityID(identity))
    }

    protected getFromRemote(identity: SocialIdentity): Promise<Array<SocialAddress<NetworkPluginID>>> {
        throw new Error('Method not implemented.')
    }

    async lookup(identity: SocialIdentity): Promise<Array<SocialAddress<NetworkPluginID>>> {
        const ID = this.getIdentityID(identity)
        if (!ID) return EMPTY_LIST

        const fromCache = this.getFromCache(identity)
        if (fromCache) return fromCache

        const fromRemote = this.getFromRemote(identity)
        this.cache.set(ID, fromRemote)

        return fromRemote
    }
}
