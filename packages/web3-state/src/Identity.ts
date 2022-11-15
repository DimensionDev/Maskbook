import LRU from 'lru-cache'
import { groupBy, first, compact, uniq } from 'lodash-es'
import {
    SocialAddress,
    SocialIdentity,
    IdentityServiceState as Web3SocialIdentityState,
    SocialAddressType,
    SocialAccount,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export class IdentityServiceState implements Web3SocialIdentityState<Web3Helper.ChainIdAll> {
    protected cache = new LRU<string, Promise<Array<SocialAddress<NetworkPluginID>>>>({
        max: 20,
        ttl: Number.MAX_SAFE_INTEGER,
    })

    private getIdentityID(identity: SocialIdentity) {
        if (!identity.identifier) return ''
        return [
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

    protected getFromRemote(identity: SocialIdentity): Promise<Array<SocialAddress<NetworkPluginID>>> {
        throw new Error('Method not implemented.')
    }

    async lookup(identity: SocialIdentity): Promise<Array<SocialAddress<NetworkPluginID>>> {
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

    __mergeSocialAddressesAll__(socialAddresses: Array<SocialAddress<NetworkPluginID>>) {
        const accountsGrouped = groupBy(socialAddresses, (x) => `${x.pluginID}_${x.address.toLowerCase()}`)
        return Object.entries(accountsGrouped).map<SocialAccount<Web3Helper.ChainIdAll>>(([, group]) => {
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
