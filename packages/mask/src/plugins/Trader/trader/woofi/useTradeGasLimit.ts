import type { WoofiSwapData, TradeComputed } from '../../types'
import { useMemo } from 'react'
import { isNativeTokenAddress, useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { pick } from 'lodash-unified'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { useWooRouterV2Contract } from '../../contracts/woofi/useWooRouterV2Contract'
import { useGetTradeContext } from '../useGetTradeContext'
import { TradeProvider } from '@masknet/public-api'
import { WOOFI_NATIVE_TOKEN_ADDRESS } from '../../constants'

export function useTradeGasLimit(tradeComputed: TradeComputed<WoofiSwapData> | null): AsyncState<number> {
    const context = useGetTradeContext(TradeProvider.WOOFI)
    const { targetChainId } = TargetChainIdContext.useContainer()
    const web3 = useWeb3({ chainId: targetChainId })
    const account = useAccount()
    const swapRouterContract = useWooRouterV2Contract(context?.ROUTER_CONTRACT_ADDRESS, targetChainId)
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        }
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!config || !tradeComputed?.inputToken || !tradeComputed?.outputToken) return 0
        const { inputToken, outputToken, inputAmount, minimumReceived } = tradeComputed!
        const sellToken = isNativeTokenAddress(inputToken) ? WOOFI_NATIVE_TOKEN_ADDRESS : inputToken!.address
        const buyToken = isNativeTokenAddress(outputToken) ? WOOFI_NATIVE_TOKEN_ADDRESS : outputToken!.address
        return swapRouterContract?.methods
            .swap(sellToken, buyToken, inputAmount.toString(), minimumReceived.toString(), account, account)
            .estimateGas(config)
    }, [config, web3])
}
