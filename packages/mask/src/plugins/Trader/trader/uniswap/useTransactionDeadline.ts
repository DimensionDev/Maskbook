import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { ChainId, useCurrentBlockTimestamp } from '@masknet/web3-shared-evm'
import { DEFAULT_TRANSACTION_DEADLINE, L2_TRANSACTION_DEADLINE } from '../../constants'
import { TargetChainIdContext } from '../useTargetChainIdContext'

export function useTransactionDeadline() {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { value: timestamp } = useCurrentBlockTimestamp()

    return useMemo(() => {
        if (!timestamp) return
        const timestamp_ = new BigNumber(timestamp ?? '0')
        return timestamp_.plus(ChainId.Mainnet === chainId ? DEFAULT_TRANSACTION_DEADLINE : L2_TRANSACTION_DEADLINE)
    }, [chainId, timestamp])
}
