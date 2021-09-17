import { TransactionEventType, TransactionStateType, useAccount, useTransactionState } from '@masknet/web3-shared'
import { useCallback } from 'react'
import { usePoolContract } from '../contracts'

export function useDepositCallback(address: string, shortPrincipalAmount: string, longPrincipalAmount: string) {
    const poolContract = usePoolContract(address)
    const account = useAccount()
    const [depositState, setDepositState] = useTransactionState()
    const depositCallback = useCallback(async () => {
        if (!poolContract) {
            setDepositState({
                type: TransactionStateType.UNKNOWN,
            })

            return
        }

        // pre-step: start waiting for provider to confirm tx
        setDepositState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config = { from: account, value: 0 }
        const estimatedGas = await poolContract.methods
            .deposit(shortPrincipalAmount, longPrincipalAmount)
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
            const promiEvent = poolContract.methods.deposit(shortPrincipalAmount, longPrincipalAmount).send({
                ...config,
                gas: estimatedGas,
            })
            promiEvent
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
    }, [account, address, shortPrincipalAmount, longPrincipalAmount])

    const resetCallback = useCallback(() => {
        setDepositState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [depositState, depositCallback, resetCallback] as const
}
