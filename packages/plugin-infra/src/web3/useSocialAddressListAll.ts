import LRUCache from 'lru-cache'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkPluginID, SocialAddress, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'

type AddressList = Array<SocialAddress<NetworkPluginID>>
type CacheValue = Promise<Array<PromiseSettledResult<AddressList>>>

const addressCache = new LRUCache<string, CacheValue>({
    max: 500,
    ttl: 2 * 60 * 1000,
})

/**
 * Get all social addresses under of all networks.
 */
export function useSocialAddressListAll(
    identity?: SocialIdentity,
    typeWhitelist?: SocialAddressType[],
    sorter?: (a: SocialAddress<NetworkPluginID>, z: SocialAddress<NetworkPluginID>) => number,
) {
    // TODO: to add flow
    const { IdentityService: EVM_IdentityService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { IdentityService: SolanaIdentityService } = useWeb3State(NetworkPluginID.PLUGIN_SOLANA)

    return useAsyncRetry(async () => {
        const userId = identity?.identifier?.userId
        if (!userId || userId === '$unknown') return EMPTY_LIST
        let cached = addressCache.get(userId)

        if (!cached || identity.isOwner) {
            cached = Promise.allSettled<AddressList>(
                [EVM_IdentityService, SolanaIdentityService].map((x) => x?.lookup(identity) ?? []),
            )
            if (!identity.isOwner) {
                addressCache.set(`${userId}_${identity.publicKey ?? ''}`, cached)
            }
        }
        const allSettled = await cached
        const listOfAddress = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
        if (allSettled.every((x) => x.status === 'rejected')) {
            addressCache.delete(userId)
        }
        const sorted = sorter && listOfAddress.length ? listOfAddress.sort(sorter) : listOfAddress
        return typeWhitelist?.length ? sorted.filter((x) => typeWhitelist.includes(x.type)) : sorted
    }, [identity, sorter, typeWhitelist?.join(), EVM_IdentityService?.lookup, SolanaIdentityService?.lookup])
}
