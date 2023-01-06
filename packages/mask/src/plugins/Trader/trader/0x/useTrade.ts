import { ChainId, chainResolver, isNativeTokenAddress, NetworkType } from '@masknet/web3-shared-evm'
import { safeUnreachable } from '@masknet/kit'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants/index.js'
import { PluginTraderRPC } from '../../messages.js'
import { SwapQuoteResponse, TradeStrategy } from '../../types/index.js'
import { useSlippageTolerance } from '../0x/useSlippageTolerance.js'
import { useChainContext, useDoubleBlockBeatRetry, useNetworkContext } from '@masknet/web3-hooks-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { isZero } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

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
        case NetworkType.Optimism:
        case NetworkType.Harmony:
        case NetworkType.Conflux:
        case NetworkType.Astar:
        case NetworkType.Moonbeam:
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
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
    temporarySlippage?: number,
): AsyncStateRetry<SwapQuoteResponse | null> {
    const { account, chainId, networkType } = useChainContext()
    const { pluginID } = useNetworkContext()
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting

    // Current only support
    return useDoubleBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!inputToken || !outputToken || pluginID !== NetworkPluginID.PLUGIN_EVM) return null
            const isExactIn = strategy === TradeStrategy.ExactIn
            if (isZero(inputAmount) && isExactIn) return null
            if (isZero(outputAmount) && !isExactIn) return null

            const sellToken = isNativeTokenAddress(inputToken.address)
                ? getNativeTokenLabel(chainResolver.networkType(chainId as ChainId) ?? (networkType as NetworkType))
                : inputToken.address
            const buyToken = isNativeTokenAddress(outputToken.address)
                ? getNativeTokenLabel(chainResolver.networkType(chainId as ChainId) ?? (networkType as NetworkType))
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
                chainResolver.networkType(chainId as ChainId) ?? (networkType as NetworkType),
            )
        },
        [
            networkType,
            account,
            strategy,
            inputAmount,
            outputAmount,
            inputToken?.address,
            outputToken?.address,
            slippage,
            chainId,
            pluginID,
        ],
    )
}
