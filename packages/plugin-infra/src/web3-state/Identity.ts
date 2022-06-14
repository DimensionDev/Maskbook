import LRU from 'lru-cache'
import type {
    SocialAddress,
    SocialIdentity,
    IdentityServiceState as Web3SocialIdentityState,
    NetworkPluginID,
} from '@masknet/web3-shared-base'

export class IdentityServiceState implements Web3SocialIdentityState {
    protected cache = new LRU<string, Array<SocialAddress<NetworkPluginID>>>({
        max: 20,
        ttl: Number.MAX_SAFE_INTEGER,
    })

    private getIdentityID(identity: SocialIdentity) {
        if (!identity.identifier) return ''
        return `${identity.identifier.network}_${identity.identifier.userId}`
    }

    protected getFromCache(identity: SocialIdentity): Promise<Array<SocialAddress<NetworkPluginID>>> {
        return Promise.resolve(this.cache.get(this.getIdentityID(identity)) ?? [])
    }

    protected getFromRemote(identity: SocialIdentity): Promise<Array<SocialAddress<NetworkPluginID>>> {
        throw new Error('Method not implemented.')
    }

    async lookup(identity: SocialIdentity): Promise<Array<SocialAddress<NetworkPluginID>>> {
        const ID = this.getIdentityID(identity)
        if (!ID) return []

        const fromCache = await this.getFromCache(identity)
        if (fromCache.length) return fromCache

        const fromRemote = await this.getFromRemote(identity)
        if (fromRemote.length) this.cache.set(ID, fromRemote)

        return fromRemote
    }
}
