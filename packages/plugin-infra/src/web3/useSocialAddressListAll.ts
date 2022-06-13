import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'

/**
 * Get all social addresses under of all networks.
 */
export function useSocialAddressListAll(
    identity?: SocialIdentity,
    sorter?: (a: SocialAddress<NetworkPluginID>, z: SocialAddress<NetworkPluginID>) => number,
) {
    // TODO: To Add Flow
    const { IdentityService: EVM_IdentityService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { IdentityService: SolanaIdentityService } = useWeb3State(NetworkPluginID.PLUGIN_SOLANA)

    return useAsyncRetry(async () => {
        const userId = identity?.identifier?.userId
        if (!userId || userId === '$unknown') return EMPTY_LIST

        const allSettled = await Promise.allSettled<Array<SocialAddress<NetworkPluginID>>>(
            [EVM_IdentityService, SolanaIdentityService].map((x) => x?.lookup(identity) ?? []),
        )
        const listOfAddress = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
        return sorter && listOfAddress.length ? listOfAddress.sort(sorter) : listOfAddress
    }, [identity, sorter, EVM_IdentityService?.lookup, SolanaIdentityService?.lookup])
}
