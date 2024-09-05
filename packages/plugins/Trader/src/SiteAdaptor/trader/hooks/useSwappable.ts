import { useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { useTraderTrans } from '../../../locales/i18n_generated.js'
import { useSwap } from '../contexts/index.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { isLessThan, rightShift } from '@masknet/web3-shared-base'
import { useGasConfig } from '@masknet/web3-hooks-evm'

export function useSwappable(): [result: boolean, message?: string] {
    const t = useTraderTrans()
    const { inputAmount, chainId, fromToken, quote } = useSwap()
    const { data: balance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, fromToken?.address, { chainId })
    useGasConfig(chainId)
    if (!inputAmount) return [false, t.enter_an_amount()]

    const amount = rightShift(inputAmount, fromToken?.decimals)
    if (isLessThan(balance || 0, amount)) return [false, t.insufficient_balance({ symbol: fromToken?.symbol! })]

    if (!quote) return [false]

    return [true]
}
