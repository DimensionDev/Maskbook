import type { Trade, TradeComputed } from '../../types'
import { useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import { useSwapParameters as useTradeParameters } from './useTradeParameters'
import type { TradeProvider } from '@masknet/public-api'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { useAsync } from 'react-use'
import BigNumber from 'bignumber.js'
import { swapErrorToUserReadableMessage } from '../../helpers'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useTradeGasLimit(trade: TradeComputed<Trade> | null, tradeProvider: TradeProvider): AsyncState<number> {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const web3 = useWeb3(false, targetChainId)
    const account = useAccount()
    const tradeParameters = useTradeParameters(trade, tradeProvider)

    return useAsync(async () => {
        const estimateGases = await Promise.all(
            tradeParameters.map(async (x) => {
                const { address, calldata, value } = x
                const config = {
                    from: account,
                    to: address,
                    data: calldata,
                    ...(!value || /^0x0*$/.test(value)
                        ? {}
                        : { value: `0x${Number.parseInt(value, 16).toString(16)}` }),
                }
                return web3.eth
                    .estimateGas(config)
                    .then((gasEstimate) => {
                        return {
                            gasEstimate: new BigNumber(gasEstimate),
                        }
                    })
                    .catch((error) => {
                        return web3.eth
                            .call(config)
                            .then(() => {
                                return {
                                    error: new Error('Gas estimate failed.'),
                                }
                            })
                            .catch((error) => {
                                return {
                                    call: x,
                                    error: new Error(swapErrorToUserReadableMessage(error)),
                                }
                            })
                    })
            }),
        )
        return estimateGases
            .find(
                (el, ix, list): el is { gasEstimate: BigNumber } =>
                    'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
            )
            ?.gasEstimate.toNumber()
    }, [tradeParameters.length])
}
