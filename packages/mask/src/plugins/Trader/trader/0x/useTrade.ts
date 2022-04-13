import {
    FungibleTokenDetailed,
    getNetworkTypeFromChainId,
    isNativeTokenAddress,
    NetworkType,
    useAccount,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { safeUnreachable } from '@dimensiondev/kit'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { SwapQuoteResponse, TradeStrategy } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'
import { currentNetworkSettings } from '../../../Wallet/settings'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { useDoubleBlockBeatRetry } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export function getNativeTokenLabel(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return 'ETH'
        case NetworkType.Binance:
        case NetworkType.Polygon:
        case NetworkType.Arbitrum:
        case NetworkType.xDai:
        case NetworkType.Celo:
        case NetworkType.Fantom:
        case NetworkType.Aurora:
        case NetworkType.Boba:
        case NetworkType.Fuse:
        case NetworkType.Metis:
        case NetworkType.Avalanche:
        case NetworkType.Optimistic:
        case NetworkType.Conflux:
            return NATIVE_TOKEN_ADDRESS
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
    temporarySlippage?: number,
): AsyncStateRetry<SwapQuoteResponse | null> {
    const account = useAccount()
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(targetChainId)

    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    return useDoubleBlockBeatRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null

        const sellToken = isNativeTokenAddress(inputToken)
            ? getNativeTokenLabel(getNetworkTypeFromChainId(targetChainId) ?? currentNetworkSettings.value)
            : inputToken.address
        const buyToken = isNativeTokenAddress(outputToken)
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
        NATIVE_TOKEN_ADDRESS,
        account,
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        slippage,
    ])
}
