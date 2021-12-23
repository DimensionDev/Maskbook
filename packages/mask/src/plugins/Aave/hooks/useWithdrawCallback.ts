import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import {
    FungibleTokenDetailed,
    EthereumTokenType,
    useAccount,
    useTransactionState,
    TransactionStateType,
    TransactionEventType,
} from '@masknet/web3-shared-evm'
import { useAaveLendingPoolContract } from '../contracts/useAaveLendingPool'

/**
 * A callback for withdraw into pool
 * @param poolAddress the pool address
 * @param token withdraw aToken
 * @param amount
 * @param referrer
 
 */
export function useWithdrawCallback(
    poolAddress: string,
    token: FungibleTokenDetailed,
    amount: string,
    referrer: string,
) {
    const poolContract = useAaveLendingPoolContract(poolAddress)

    const account = useAccount()
    const [withdrawState, setWithdrawState] = useTransactionState()

    const withdrawCallback = useCallback(async () => {
        if (!poolContract) {
            setWithdrawState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setWithdrawState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
        }
        const estimatedGas = await poolContract.methods
            .withdraw(token.address, amount, account)
            .estimateGas(config)
            .catch((error: any) => {
                setWithdrawState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            poolContract.methods
                .withdraw(token.address, amount, account)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash: any) => {
                    setWithdrawState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error: any) => {
                    setWithdrawState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [poolAddress, amount, token, referrer])

    const resetCallback = useCallback(() => {
        setWithdrawState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [withdrawState, withdrawCallback, resetCallback] as const
}
