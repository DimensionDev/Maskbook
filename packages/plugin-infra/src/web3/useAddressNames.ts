import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID, IdentityAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'

export function useAddressNames<T extends NetworkPluginID>(
    pluginID?: T,
    identity?: SocialIdentity,
    sorter?: (a: IdentityAddress, z: IdentityAddress) => number,
) {
    type Lookup = (identity: SocialIdentity) => Promise<IdentityAddress[]>

    const { IdentityService } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!identity || !IdentityService?.lookup) return EMPTY_LIST
        const listOfAddress = (await (IdentityService.lookup as Lookup)(identity)) ?? EMPTY_LIST
        return sorter && listOfAddress.length ? listOfAddress.sort(sorter) : listOfAddress
    }, [identity, sorter, IdentityService])
}
