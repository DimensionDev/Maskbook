import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { ChainId, useChainId, useCurrentBlockTimestamp } from '@masknet/web3-shared-evm'
import { DEFAULT_TRANSACTION_DEADLINE, L2_TRANSACTION_DEADLINE } from '../../constants'

export function useTransactionDeadline() {
    const chainId = useChainId()
    const { value: timestamp } = useCurrentBlockTimestamp()

    return useMemo(() => {
        if (!timestamp) return
        const timestamp_ = new BigNumber(timestamp ?? '0')
        return timestamp_.plus(ChainId.Mainnet === chainId ? DEFAULT_TRANSACTION_DEADLINE : L2_TRANSACTION_DEADLINE)
    }, [chainId, timestamp])
}
