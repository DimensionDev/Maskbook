import { useAsyncRetry } from 'react-use'
import {
    EMPTY_LIST,
    type NetworkPluginID,
    type SocialIdentity,
    type SocialAddress,
    type SocialAddressType,
} from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

/**
 * Get all social addresses under a specific network.
 */
export function useSocialAddresses<T extends NetworkPluginID>(
    pluginID?: T,
    identity?: SocialIdentity,
    includes?: SocialAddressType[],
    sorter?: <V = T>(a: SocialAddress<V>, z: SocialAddress<V>) => number,
) {
    const { IdentityService } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!identity?.identifier?.userId || !IdentityService?.lookup) return EMPTY_LIST
        const listOfAddress = await IdentityService.lookup(identity)
        const sorted = sorter && listOfAddress.length ? listOfAddress.sort(sorter) : listOfAddress
        return includes?.length ? sorted.filter((x) => includes.includes(x.type)) : sorted
    }, [identity?.identifier?.userId, includes?.join(','), sorter, IdentityService?.lookup])
}
