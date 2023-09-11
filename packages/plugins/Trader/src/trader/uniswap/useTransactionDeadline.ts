import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { useBlockTimestamp, useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { DEFAULT_TRANSACTION_DEADLINE, L2_TRANSACTION_DEADLINE } from '../../constants/index.js'

export function useTransactionDeadline() {
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { value: timestamp } = useBlockTimestamp(pluginID, { chainId })

    return useMemo(() => {
        if (!timestamp || pluginID !== NetworkPluginID.PLUGIN_EVM) return
        const timestamp_ = new BigNumber(timestamp ?? '0')
        return timestamp_.plus(ChainId.Mainnet === chainId ? DEFAULT_TRANSACTION_DEADLINE : L2_TRANSACTION_DEADLINE)
    }, [chainId, timestamp, pluginID])
}
