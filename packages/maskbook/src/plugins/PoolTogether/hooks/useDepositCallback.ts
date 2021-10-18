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
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool'

/**
 * A callback for deposit into pool
 * @param address the pool address
 * @param amount
 * @param controlledToken the ticket token address
 * @param referrer
 * @param token deposit token
 */
export function useDepositCallback(
    address: string,
    amount: string,
    controlledToken: string,
    referrer: string,
    token?: FungibleTokenDetailed,
) {
    const poolContract = usePoolTogetherPoolContract(address)

    const account = useAccount()
    const [depositState, setDepositState] = useTransactionState()

    const depositCallback = useCallback(async () => {
        if (!token || !poolContract) {
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
            .depositTo(account, amount, controlledToken, referrer)
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
            const promiEvent = poolContract.methods.depositTo(account, amount, controlledToken, referrer).send({
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
    }, [address, account, amount, token, referrer, controlledToken])

    const resetCallback = useCallback(() => {
        setDepositState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [depositState, depositCallback, resetCallback] as const
}
