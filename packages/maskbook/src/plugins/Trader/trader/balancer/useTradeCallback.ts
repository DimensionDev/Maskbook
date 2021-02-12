import { useCallback, useMemo, useState } from 'react'
import type { TransactionConfig } from 'web3-core'
import stringify from 'json-stable-stringify'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { TransactionState, TransactionStateType } from '../../../../web3/hooks/useTransactionState'

export function useTradeCallback() {
    const account = useAccount()
    const chainId = useChainId()

    // compose transaction config
    const config = useMemo(() => {
        return {
            from: account,
        } as TransactionConfig
    }, [account])

    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    const tradeCallback = useCallback(async () => {}, [])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [account, chainId, stringify(config)])

    return [tradeState, tradeCallback, resetCallback] as const
}
