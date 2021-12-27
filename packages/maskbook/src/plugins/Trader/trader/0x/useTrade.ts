import {
    NetworkType,
    FungibleTokenDetailed,
    isNative,
    useBlockNumber,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { safeUnreachable } from '@dimensiondev/kit'
import { useAccount } from '@masknet/web3-shared-evm'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'
import { useTradeProviderSettings } from '../useTradeSettings'
import { currentNetworkSettings } from '../../../Wallet/settings'

export function getNativeTokenLabel(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return 'ETH'
        case NetworkType.Binance:
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        case NetworkType.Polygon:
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        case NetworkType.Arbitrum:
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        case NetworkType.xDai:
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        case NetworkType.Boba:
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        default:
            safeUnreachable(networkType)
            return ''
    }
}

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const account = useAccount()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const blockNumber = useBlockNumber()

    const slippage = useSlippageTolerance()
    const { pools } = useTradeProviderSettings()
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null

        const sellToken = isNative(inputToken.address)
            ? getNativeTokenLabel(currentNetworkSettings.value)
            : inputToken.address
        const buyToken = isNative(outputToken.address)
            ? getNativeTokenLabel(currentNetworkSettings.value)
            : outputToken.address
        return PluginTraderRPC.swapQuote(
            {
                sellToken,
                buyToken,
                takerAddress: account,
                sellAmount: isExactIn ? inputAmount : void 0,
                buyAmount: isExactIn ? void 0 : outputAmount,
                skipValidation: true,
                slippagePercentage: slippage,
                affiliateAddress: ZRX_AFFILIATE_ADDRESS,
            },
            currentNetworkSettings.value,
        )
    }, [
        NATIVE_TOKEN_ADDRESS,
        account,
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        slippage,
        pools.length,
        blockNumber, // refresh api each block
    ])
}
