import { useAsyncRetry } from 'react-use'
import {
    EMPTY_LIST,
    NetworkPluginID,
    type SocialAddress,
    type SocialAddressType,
    type SocialIdentity,
} from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'

type AddressList = Array<SocialAddress<Web3Helper.ChainIdAll>>

/**
 * Get all social addresses across all networks.
 */
export function useSocialAddressesAll(
    identity?: SocialIdentity,
    includes?: SocialAddressType[],
    sorter?: (a: SocialAddress<Web3Helper.ChainIdAll>, z: SocialAddress<Web3Helper.ChainIdAll>) => number,
) {
    // TODO: to add flow
    const { IdentityService: EVM_IdentityService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { IdentityService: SolanaIdentityService } = useWeb3State(NetworkPluginID.PLUGIN_SOLANA)

    return useAsyncRetry<Array<SocialAddress<Web3Helper.ChainIdAll>>>(async () => {
        const userId = identity?.identifier?.userId
        if (!userId || userId === '$unknown') return EMPTY_LIST

        const allSettled = await Promise.allSettled<AddressList>(
            [EVM_IdentityService, SolanaIdentityService].map((x) => x?.lookup(identity) ?? []),
        )

        const listOfAddress = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
        const sorted = sorter && listOfAddress.length ? listOfAddress.sort(sorter) : listOfAddress
        return includes?.length ? sorted.filter((x) => includes.includes(x.type)) : sorted
    }, [identity, sorter, includes?.join(','), EVM_IdentityService?.lookup, SolanaIdentityService?.lookup])
}
