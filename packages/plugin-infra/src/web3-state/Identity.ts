import LRU from 'lru-cache'
import type {
    SocialAddress,
    SocialIdentity,
    IdentityServiceState as Web3SocialIdentityState,
    NetworkPluginID,
    SocialAddressType,
} from '@masknet/web3-shared-base'

export class IdentityServiceState implements Web3SocialIdentityState {
    protected cache = new LRU<string, Promise<Array<SocialAddress<NetworkPluginID>>>>({
        max: 20,
        ttl: Number.MAX_SAFE_INTEGER,
    })

    private getIdentityID(identity: SocialIdentity, includes: SocialAddressType[] = []) {
        if (!identity.identifier) return ''
        return [
            identity.identifier.network,
            identity.identifier.userId,
            identity.bio,
            identity.homepage,
            ...includes,
        ].join('_')
    }

    protected getFromCache(identity: SocialIdentity, includes?: SocialAddressType[]) {
        return this.cache.get(this.getIdentityID(identity, includes))
    }

    protected getFromRemote(
        identity: SocialIdentity,
        includes?: SocialAddressType[],
    ): Promise<Array<SocialAddress<NetworkPluginID>>> {
        throw new Error('Method not implemented.')
    }

    async lookup(
        identity: SocialIdentity,
        includes?: SocialAddressType[],
    ): Promise<Array<SocialAddress<NetworkPluginID>>> {
        const ID = this.getIdentityID(identity, includes)
        if (!ID) return []

        const fromCache = this.getFromCache(identity, includes)
        if (fromCache) return fromCache

        const fromRemote = this.getFromRemote(identity, includes)
        this.cache.set(ID, fromRemote)

        return fromRemote
    }
}
