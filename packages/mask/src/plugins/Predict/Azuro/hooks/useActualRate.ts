import { useAsync } from 'react-use'
import type { Odds } from '../types'
import BigNumber from 'bignumber.js'
import { calculateActualRate } from '../api'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useActualRate(condition: Odds | null, amount: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsync(async () => {
        if (!condition || !amount) return
        const conditionId = condition.conditionId
        const outcomeId = condition.outcomeId
        const betAmount = new BigNumber(amount).toNumber()

        const calculation = await calculateActualRate({
            chainId,
            conditionId,
            outcomeId,
            betAmount,
        })

        return calculation
    }, [amount, condition])
}
