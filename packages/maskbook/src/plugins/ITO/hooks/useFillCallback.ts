import { useCallback, useState } from 'react'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useITO_Contract } from '../contracts/useITO_Contract'

export interface PoolSettings {}

export function useFillCallback(poolSettings: PoolSettings) {
    const account = useAccount()
    const [fillState, setFillState] = useTransactionState()
    const ITO_Contract = useITO_Contract()
    const [fillSettings, setFillSettings] = useState<PoolSettings | null>(null)

    const fillCallback = useCallback(async () => {}, [])

    const resetCallback = useCallback(() => {
        setFillState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])
    return [fillSettings, fillState, fillCallback, resetCallback] as const
}
