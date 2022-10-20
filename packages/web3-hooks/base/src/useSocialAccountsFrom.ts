import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { SocialAddress } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State.js'

/**
 * Merge many social addresses into a social account.
 */
export function useSocialAccountsFrom(socialAddresses: Array<SocialAddress<NetworkPluginID>>) {
    const { IdentityService } = useWeb3State()
    return useMemo(() => {
        return IdentityService?.__mergeSocialAddressesAll__(socialAddresses)
    }, [socialAddresses, IdentityService])
}
