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
 * A callback for deposit into pool
 * @param poolAddress the pool address
 * @param token deposit Token
 * @param amount
 * @param referrer
 */
export function useDepositCallback(
    poolAddress: string,
	token: FungibleTokenDetailed,
    amount: string,
    referrer: string
    
) {
    const poolContract = useAaveLendingPoolContract(poolAddress)

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
	
        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
        }
        const estimatedGas = await poolContract.methods
            .deposit(token.address, amount, account, referrer)
            .estimateGas(config)
            .catch((error: any ) => {
                setDepositState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            poolContract.methods
                .deposit(token.address, amount, account, referrer)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash: any) => {
					
                    setDepositState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error: any) => {
					
                    setDepositState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [poolAddress, amount, token, referrer])

    const resetCallback = useCallback(() => {
        setDepositState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [depositState, depositCallback, resetCallback] as const
}
