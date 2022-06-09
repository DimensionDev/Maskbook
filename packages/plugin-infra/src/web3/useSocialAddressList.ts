import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'

/**
 * Get all social addresses under a specific network.
 */
export function useSocialAddressList<T extends NetworkPluginID>(
    pluginID?: T,
    identity?: SocialIdentity,
    sorter?: (a: SocialAddress<T>, z: SocialAddress<T>) => number,
) {
    type Lookup = (identity: SocialIdentity) => Promise<Array<SocialAddress<T>>>

    const { IdentityService } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!identity?.identifier?.userId || !IdentityService?.lookup) return EMPTY_LIST
        const listOfAddress = (await (IdentityService.lookup as Lookup)(identity)) ?? EMPTY_LIST
        return sorter && listOfAddress.length ? listOfAddress.sort(sorter) : listOfAddress
    }, [identity?.identifier?.userId, sorter, IdentityService?.lookup])
}
