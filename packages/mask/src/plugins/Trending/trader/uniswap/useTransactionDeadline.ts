import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { DEFAULT_TRANSACTION_DEADLINE, L2_TRANSACTION_DEADLINE } from '../../constants'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useBlockTimestamp } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useTransactionDeadline() {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { value: timestamp } = useBlockTimestamp(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useMemo(() => {
        if (!timestamp) return
        const timestamp_ = new BigNumber(timestamp ?? '0')
        return timestamp_.plus(ChainId.Mainnet === chainId ? DEFAULT_TRANSACTION_DEADLINE : L2_TRANSACTION_DEADLINE)
    }, [chainId, timestamp])
}
