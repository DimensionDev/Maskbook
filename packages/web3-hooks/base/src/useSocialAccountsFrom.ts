import { useMemo } from 'react'
import type { SocialAddress } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'

/**
 * Merge many social addresses into a social account.
 */
export function useSocialAccountsFrom(socialAddresses: Array<SocialAddress<Web3Helper.ChainIdAll>>) {
    const { IdentityService } = useWeb3State()
    return useMemo(() => {
        return IdentityService?.mergeSocialAddressesAllDoNotOverride(socialAddresses)
    }, [socialAddresses, IdentityService])
}
