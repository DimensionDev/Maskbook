import { LRUCache } from 'lru-cache'
import { groupBy, first, compact, uniq } from 'lodash-es'
import {
    type SocialAddress,
    type SocialIdentity,
    type SocialAccount,
    SocialAddressType,
    EMPTY_LIST,
} from '@masknet/shared-base'
import { type IdentityServiceState as Web3SocialIdentityState } from '@masknet/web3-shared-base'

export class IdentityServiceState<ChainId> implements Web3SocialIdentityState<ChainId> {
    protected cache = new LRUCache<string, Promise<Array<SocialAddress<ChainId>>>>({
        max: 20,
        ttl: Number.MAX_SAFE_INTEGER,
    })

    private getIdentityID(identity: SocialIdentity) {
        if (!identity.identifier) return ''
        return [
            '1', // version
            identity.identifier.network,
            identity.identifier.userId,
            identity.bio,
            identity.homepage,
            identity.publicKey ?? '',
        ].join('_')
    }

    protected getFromCache(identity: SocialIdentity) {
        return this.cache.get(this.getIdentityID(identity))
    }

    protected getFromRemote(identity: SocialIdentity): Promise<Array<SocialAddress<ChainId>>> {
        throw new Error('Method not implemented.')
    }

    async lookup(identity: SocialIdentity): Promise<Array<SocialAddress<ChainId>>> {
        const ID = this.getIdentityID(identity)
        if (!ID) return EMPTY_LIST

        const fromCache = this.getFromCache(identity)
        if (fromCache && !identity.isOwner) return fromCache

        const fromRemote = this.getFromRemote(identity)
        if (!identity.isOwner) {
            this.cache.set(ID, fromRemote)
        }

        return fromRemote
    }

    __mergeSocialAddressesAll__(socialAddresses: Array<SocialAddress<ChainId>>) {
        const accountsGrouped = groupBy(socialAddresses, (x) => `${x.pluginID}_${x.address.toLowerCase()}`)
        return Object.entries(accountsGrouped).map<SocialAccount<ChainId>>(([, group]) => {
            return {
                pluginID: group[0].pluginID,
                address: group[0].address,
                label:
                    first(
                        compact(
                            [SocialAddressType.ENS, SocialAddressType.RSS3, SocialAddressType.SOL].map(
                                (x) => group.find((y) => y.type === x)?.label,
                            ),
                        ),
                    ) ?? group[0].label,
                // The supportedChainIds support all chains by default. If not set value, should keep it.
                supportedChainIds: group.find((x) => !x.chainId)
                    ? undefined
                    : uniq(compact(group.map((x) => x.chainId))),
                supportedAddressTypes: uniq(group.map((x) => x.type)),
            }
        })
    }
}
