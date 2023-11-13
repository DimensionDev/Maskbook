import { LRUCache } from 'lru-cache'
import { groupBy, compact, uniq, first } from 'lodash-es'
import {
    type SocialAddress,
    type SocialIdentity,
    type SocialAccount,
    SocialAddressType,
    EMPTY_LIST,
} from '@masknet/shared-base'
import { type IdentityServiceState as Web3SocialIdentityState } from '@masknet/web3-shared-base'

export abstract class IdentityServiceState<ChainId> implements Web3SocialIdentityState<ChainId> {
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

    protected abstract getFromRemote(identity: SocialIdentity): Promise<Array<SocialAddress<ChainId>>>

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

    mergeSocialAddressesAllDoNotOverride = (socialAddresses: Array<SocialAddress<ChainId>>) => {
        const accountGroups = groupBy(socialAddresses, (x) => `${x.pluginID}_${x.address.toLowerCase()}`)
        const domainAddressTypes = [
            SocialAddressType.ENS,
            SocialAddressType.SPACE_ID,
            SocialAddressType.ARBID,
            SocialAddressType.Lens,
            SocialAddressType.RSS3,
            SocialAddressType.SOL,
        ]
        return Object.entries(accountGroups).map<SocialAccount<ChainId>>(([, accounts]) => {
            const domainLabels = compact(domainAddressTypes.map((x) => accounts.find((y) => y.type === x)?.label))
            const theFirstAccount = accounts[0]
            return {
                pluginID: theFirstAccount.pluginID,
                address: theFirstAccount.address,
                label: first(domainLabels) || theFirstAccount.label,
                // The supportedChainIds support all chains by default. If not set value, should keep it.
                supportedChainIds:
                    accounts.find((x) => !x.chainId) ? undefined : uniq(compact(accounts.map((x) => x.chainId))),
                supportedAddressTypes: uniq(accounts.map((x) => x.type)),
            }
        })
    }
}
