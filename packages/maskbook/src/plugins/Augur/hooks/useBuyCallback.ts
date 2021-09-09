import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import {
    FungibleTokenDetailed,
    EthereumTokenType,
    useAccount,
    useTransactionState,
    TransactionStateType,
    addGasMargin,
    TransactionEventType,
} from '@masknet/web3-shared'
import { useAmmFactory } from '../contracts/useAmmFactory'
import type { AmmOutcome, Market } from '../types'

export function useBuyCallback(
    amount: string,
    minTokenOut: string,
    market?: Market,
    outcome?: AmmOutcome,
    token?: FungibleTokenDetailed,
) {
    const ammContract = useAmmFactory(market?.ammAddress ?? '')

    const account = useAccount()
    const [buyState, setBuyState] = useTransactionState()

    const buyCallback = useCallback(async () => {
        if (!token || !ammContract || !market || !outcome) {
            setBuyState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setBuyState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
        }

        const estimatedGas = await ammContract.methods
            .buy(market.address, market.id, outcome.id, amount, minTokenOut)
            .estimateGas(config)
            .catch((error) => {
                setBuyState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            const promiEvent = ammContract.methods
                .buy(market.address, market.id, outcome.id, amount, minTokenOut)
                .send({
                    gas: addGasMargin(estimatedGas).toFixed(),
                    ...config,
                })
            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setBuyState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setBuyState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setBuyState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, amount, token, minTokenOut, market, outcome])

    const resetCallback = useCallback(() => {
        setBuyState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [buyState, buyCallback, resetCallback] as const
}
