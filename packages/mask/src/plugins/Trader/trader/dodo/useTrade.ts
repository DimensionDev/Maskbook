import {
    ChainId,
    isNativeTokenAddress,
    SchemaType,
    useRPCConstants,
    useTokenConstants,
    useTraderConstants,
} from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages'
import type { SwapRouteData, TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { first } from 'lodash-unified'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useAccount, useDoubleBlockBeatRetry } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    temporarySlippage?: number,
): AsyncStateRetry<SwapRouteData | null> {
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    const { RPC_URLS } = useRPCConstants(chainId)
    const providerURL = first(RPC_URLS)
    const { DODO_ETH_ADDRESS } = useTraderConstants(chainId)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    return useDoubleBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!inputToken || !outputToken) return null
            if (inputAmount === '0') return null
            const sellToken = isNativeTokenAddress(inputToken)
                ? { ...inputToken, address: DODO_ETH_ADDRESS ?? '' }
                : inputToken
            const buyToken = isNativeTokenAddress(outputToken)
                ? { ...outputToken, address: DODO_ETH_ADDRESS ?? '' }
                : outputToken
            return PluginTraderRPC.swapRoute({
                isNativeSellToken: isNativeTokenAddress(inputToken),
                fromToken: sellToken,
                toToken: buyToken,
                fromAmount: inputAmount,
                slippage: slippage / 100,
                userAddr: account,
                rpc: providerURL,
                chainId,
            })
        },
        [
            NATIVE_TOKEN_ADDRESS,
            strategy,
            inputAmount,
            outputAmount,
            inputToken?.address,
            outputToken?.address,
            slippage,
            account,
            providerURL,
            chainId,
        ],
    )
}
