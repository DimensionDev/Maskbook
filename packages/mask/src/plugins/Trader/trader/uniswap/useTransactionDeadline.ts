import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { DEFAULT_TRANSACTION_DEADLINE, L2_TRANSACTION_DEADLINE } from '../../constants/index.js'
import { useBlockTimestamp, useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

export function useTransactionDeadline() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { value: timestamp } = useBlockTimestamp(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useMemo(() => {
        if (!timestamp) return
        const timestamp_ = new BigNumber(timestamp ?? '0')
        return timestamp_.plus(ChainId.Mainnet === chainId ? DEFAULT_TRANSACTION_DEADLINE : L2_TRANSACTION_DEADLINE)
    }, [chainId, timestamp])
}
