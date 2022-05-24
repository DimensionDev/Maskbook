import { GoPlusLabs, SecurityAPI } from '@masknet/web3-providers'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { first, isEmpty } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'

type TokenSecurity = SecurityAPI.ContractSecurity &
    SecurityAPI.TokenSecurity &
    SecurityAPI.TradingSecurity & { contract: string; chainId: ChainId }

export const useTokenSecurity = (chainId: ChainId, address?: string, isTokenSecurityClosed = false) => {
    return useAsyncRetry(async () => {
        if (isTokenSecurityClosed) return
        if (!address || address === ZERO_ADDRESS) return
        let values = await GoPlusLabs.getTokenSecurity(chainId, [address])
        values ??= {}
        if (isEmpty(values)) throw new Error('Contract Not Found')
        const entity = first(Object.entries(values))
        if (!entity) return
        return { ...entity[1], contract: entity[0], chainId } as TokenSecurity
    }, [chainId, address, isTokenSecurityClosed])
}
