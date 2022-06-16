import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType, TransactionStateType } from '@masknet/web3-shared-evm'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { useTransactionState } from '@masknet/plugin-infra/web3-evm'
import type BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { useAzuroContract } from './useAzuroContract'

export function usePlaceBetCallback(
    conditionID: number,
    amount: BigNumber,
    outcomeID: number,
    deadline: number,
    minOdds: BigNumber,
) {
    const account = useAccount()
    const chainId = useChainId()

    const azuroContract = useAzuroContract()
    const [placeBetState, setPlaceBetState] = useTransactionState()
    console.log('conditionID: ', conditionID)
    console.log('amount: ', amount)
    console.log('outcomeID: ', outcomeID)
    console.log('deadline: ', deadline)
    console.log('minOdds: ', minOdds)

    const placeBetCallback = useCallback(async () => {
        if (!azuroContract) {
            setPlaceBetState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        setPlaceBetState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: NonPayableTx = {
            from: account,
            gas: await azuroContract?.methods
                .bet(conditionID, amount, outcomeID, deadline, minOdds)
                .estimateGas({ from: account })
                .catch((error) => {
                    setPlaceBetState({
                        type: TransactionStateType.FAILED,
                        error,
                    })

                    throw error
                }),
        }

        return new Promise<void>(async (resolve, reject) => {
            azuroContract.methods
                .bet(conditionID, amount, outcomeID, deadline, minOdds)
                .send(config as NonPayableTx)
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setPlaceBetState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setPlaceBetState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setPlaceBetState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, conditionID, amount, outcomeID, deadline, minOdds, chainId, azuroContract])

    const resetCallback = useCallback(() => {
        setPlaceBetState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [placeBetState, placeBetCallback, resetCallback] as const
}
