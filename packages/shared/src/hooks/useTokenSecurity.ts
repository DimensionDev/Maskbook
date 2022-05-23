import { GoPlusLabs, SecurityAPI } from '@masknet/web3-providers'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'

export type TokenSecurity = SecurityAPI.ContractSecurity &
    SecurityAPI.TokenSecurity &
    SecurityAPI.TradingSecurity & { contract: string; chainId: ChainId }

export const useTokenSecurity = (chainId: ChainId, address?: string, isTokenSecurityClosed = false) => {
    return useAsyncRetry(async () => {
        if (isTokenSecurityClosed) return
        if (!address) return
        if (!address || address === ZERO_ADDRESS) return
        const values = await GoPlusLabs.getTokenSecurity(chainId, [address])
        if (!Object.keys(values ?? {}).length) throw new Error('Contract Not Found')
        return Object.entries(values ?? {}).map((x) => ({ ...x[1], contract: x[0], chainId }))[0] as
            | TokenSecurity
            | undefined
    }, [chainId, address, isTokenSecurityClosed])
}
