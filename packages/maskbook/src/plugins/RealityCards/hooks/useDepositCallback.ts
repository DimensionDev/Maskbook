import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount, useTransactionState, TransactionStateType, TransactionEventType } from '@masknet/web3-shared-evm'
import { useRealityCardsContract } from '../contracts/usePoolTogetherPool'

/**
 * A callback for deposit into reality cards
 * @param amount
 */
export function useDepositCallback(amount: string) {
    const account = useAccount()
    const contract = useRealityCardsContract()
    const [depositState, setDepositState] = useTransactionState()

    const depositCallback = useCallback(async () => {
        if (!contract) {
            setDepositState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setDepositState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(0).toFixed(),
        }
        const estimatedGas = await contract.methods
            .deposit(amount, account)
            .estimateGas(config)
            .catch((error) => {
                setDepositState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            contract.methods
                .deposit(amount, account)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setDepositState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setDepositState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, amount, contract])

    const resetCallback = useCallback(() => {
        setDepositState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [depositState, depositCallback, resetCallback] as const
}
