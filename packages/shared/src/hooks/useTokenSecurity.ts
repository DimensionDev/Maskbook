import { useAsyncRetry } from 'react-use'
import { GoPlusLabs } from '@masknet/web3-providers'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'

export const useTokenSecurity = (chainId?: Web3Helper.ChainIdAll, address?: string, isTokenSecurityEnable = true) => {
    return useAsyncRetry(async (): Promise<SecurityAPI.TokenSecurityType | undefined> => {
        if (!isTokenSecurityEnable || !chainId) return
        if (!address || isSameAddress(address, ZERO_ADDRESS)) return
        return GoPlusLabs.getTokenSecurity(chainId as ChainId, [address])
    }, [chainId, address, isTokenSecurityEnable])
}
