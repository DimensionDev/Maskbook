import { GoPlusLabs, SecurityAPI } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { first, isEmpty } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'

type TokenSecurity = SecurityAPI.ContractSecurity &
    SecurityAPI.TokenSecurity &
    SecurityAPI.TradingSecurity & { contract: string; chainId: ChainId }

export const useTokenSecurity = (chainId: ChainId, address?: string, isTokenSecurityClosed = false) => {
    return useAsyncRetry(async (): Promise<TokenSecurity | undefined> => {
        if (isTokenSecurityClosed) return
        if (!address || isSameAddress(address, ZERO_ADDRESS)) return
        let values = await GoPlusLabs.getTokenSecurity(chainId, [address])
        values ??= {}
        if (isEmpty(values)) throw new Error('Contract Not Found')
        const entity = first(Object.entries(values))
        if (!entity) return
        return { ...entity[1], contract: entity[0], chainId }
    }, [chainId, address, isTokenSecurityClosed])
}
