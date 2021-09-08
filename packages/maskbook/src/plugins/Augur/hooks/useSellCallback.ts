import { useCallback } from 'react'
import {
    useAccount,
    useTransactionState,
    TransactionStateType,
    addGasMargin,
    TransactionEventType,
} from '@masknet/web3-shared'
import { useAmmFactory } from '../contracts/useAmmFactory'
import type { AmmOutcome, Market } from '../types'

export function useSellCallback(market?: Market, outcome?: AmmOutcome, shareTokensIn?: string[]) {
    const ammContract = useAmmFactory(market?.ammExchange?.address ?? '')
    const account = useAccount()
    const [sellState, setSellState] = useTransactionState()

    const sellCallback = useCallback(async () => {
        if (!ammContract || !market || !market.ammExchange || !outcome || !shareTokensIn) {
            setSellState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setSellState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: '0',
        }
        const estimatedGas = await ammContract.methods
            .sellForCollateral(market.address, market.id, outcome.id, shareTokensIn, '0')
            .estimateGas(config)
            .catch((error) => {
                setSellState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            const promiEvent = ammContract.methods
                .sellForCollateral(market.address, market.id, outcome.id, shareTokensIn, '0')
                .send({
                    gas: addGasMargin(estimatedGas).toFixed(),
                    ...config,
                })
            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setSellState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setSellState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setSellState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, shareTokensIn, market, outcome])

    const resetCallback = useCallback(() => {
        setSellState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [sellState, sellCallback, resetCallback] as const
}
