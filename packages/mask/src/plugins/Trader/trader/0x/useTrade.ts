import {
    FungibleTokenDetailed,
    getNetworkTypeFromChainId,
    isZeroAddress,
    NetworkType,
    useAccount,
    useBlockNumber,
} from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { safeUnreachable } from '@dimensiondev/kit'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'
import { useTradeProviderSettings } from '../useTradeSettings'
import { currentNetworkSettings } from '../../../Wallet/settings'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { TradeProvider } from '@masknet/public-api'

const ZRX_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export function getNativeTokenLabel(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return 'ETH'
        case NetworkType.Binance:
        case NetworkType.Polygon:
        case NetworkType.Arbitrum:
        case NetworkType.xDai:
        case NetworkType.Celo:
            return ZRX_NATIVE_TOKEN_ADDRESS
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
    const { targetChainId } = TargetChainIdContext.useContainer()
    const blockNumber = useBlockNumber()

    const slippage = useSlippageTolerance()
    const { pools } = useTradeProviderSettings(TradeProvider.ZRX)
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null

        const sellToken = isZeroAddress(inputToken.address)
            ? getNativeTokenLabel(getNetworkTypeFromChainId(targetChainId) ?? currentNetworkSettings.value)
            : inputToken.address
        const buyToken = isZeroAddress(outputToken.address)
            ? getNativeTokenLabel(getNetworkTypeFromChainId(targetChainId) ?? currentNetworkSettings.value)
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
            getNetworkTypeFromChainId(targetChainId) ?? currentNetworkSettings.value,
        )
    }, [
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
