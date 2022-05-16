import { useAsyncRetry } from 'react-use'
import { isSameAddress } from '@masknet/web3-shared-base'
import { SchemaType, FungibleTokenDetailed, useTokenConstants } from '@masknet/web3-shared-evm'
import { TargetChainIdContext } from '../useTargetChainIdContext'

export function useTrade(inputToken?: FungibleTokenDetailed, outputToken?: FungibleTokenDetailed) {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { WNATIVE_ADDRESS } = useTokenConstants(targetChainId)

    // to mimic the same interface with other trade providers
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return false
        // none of the tokens is native token
        if (inputToken.type !== SchemaType.Native && outputToken.type !== SchemaType.Native) return false
        // none of the tokens is wrapped native token
        if (!isSameAddress(inputToken.address, WNATIVE_ADDRESS) && !isSameAddress(outputToken.address, WNATIVE_ADDRESS))
            return false
        return true
    }, [WNATIVE_ADDRESS, inputToken, outputToken])
}
