import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../../../../web3/constants'
import { isSameAddress } from '../../../../web3/helpers'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { FungibleTokenDetailed, EthereumTokenType } from '../../../../web3/types'

export function useTrade(inputToken?: FungibleTokenDetailed, outputToken?: FungibleTokenDetailed) {
    const WETH_ADDRESS = useConstant(CONSTANTS, 'WETH_ADDRESS')

    // to mimic the same interface with other trade providers
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return false
        // none of the tokens is native token
        if (inputToken.type !== EthereumTokenType.Native && outputToken.type !== EthereumTokenType.Native) return false
        // none of the tokens is wrapped native token
        if (!isSameAddress(inputToken.address, WETH_ADDRESS) && !isSameAddress(outputToken.address, WETH_ADDRESS))
            return false
        return true
    }, [WETH_ADDRESS, inputToken, outputToken])
}
