import { useAsyncRetry } from 'react-use'
import { GoPlusLabs } from '@masknet/web3-providers'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'

export const useTokenSecurity = (chainId?: ChainId, address?: string, isTokenSecurityEnable = true) => {
    return useAsyncRetry(async (): Promise<SecurityAPI.TokenSecurityType | undefined> => {
        if (!isTokenSecurityEnable || !chainId) return
        if (!address || isSameAddress(address, ZERO_ADDRESS)) return
        return GoPlusLabs.getTokenSecurity(chainId, [address])
    }, [chainId, address, isTokenSecurityEnable])
}
