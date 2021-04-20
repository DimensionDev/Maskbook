import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../../../../web3/constants'
import { isSameAddress } from '../../../../web3/helpers'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../../web3/types'

export function useTrade(
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    const WETH_ADDRESS = useConstant(CONSTANTS, 'WETH_ADDRESS')

    // to mimic the same interface with other trade provider
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return false
        // one of tokens is not ether
        if (inputToken.type !== EthereumTokenType.Ether || outputToken.type !== EthereumTokenType.Ether) return false
        // one of tokens is not weth
        if (!isSameAddress(inputToken.address, WETH_ADDRESS) || !isSameAddress(outputToken.address, WETH_ADDRESS))
            return false
        return true
    }, [WETH_ADDRESS])
}
