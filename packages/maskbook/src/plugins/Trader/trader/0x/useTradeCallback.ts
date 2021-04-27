import { useCallback, useMemo, useState } from 'react'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-es'
import type { TransactionConfig } from 'web3-core'
import Services from '../../../../extension/service'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { useChainId } from '../../../../web3/hooks/useChainId'
import { TransactionState, TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import { ChainId } from '../../../../web3/types'
import { nonFunctionalWeb3 } from '../../../../web3/web3'
import type { SwapQuoteResponse, TradeComputed } from '../../types'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null) {
    const account = useAccount()
    const chainId = useChainId()
    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || chainId !== ChainId.Mainnet) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value', 'gas']),
        } as TransactionConfig
    }, [account, tradeComputed])

    const tradeCallback = useCallback(async () => {
        // validate config
        if (!account || !config) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // compose transaction config
        const config_ = await Services.Ethereum.composeTransaction(config).catch((error) => {
            setTradeState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            nonFunctionalWeb3.eth.sendTransaction(config_, (error, hash) => {
                if (error) {
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                } else {
                    setTradeState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                }
            })
        })
    }, [account, chainId, stringify(config)])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
