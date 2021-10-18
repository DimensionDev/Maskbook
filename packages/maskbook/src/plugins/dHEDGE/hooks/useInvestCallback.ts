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
import { useDHedgePoolV1Contract, useDHedgePoolV2Contract } from '../contracts/useDHedgePool'
import { Pool, PoolType } from '../types'

/**
 * A callback for invest dhedge pool
 * @param pool the pool
 * @param amount
 * @param token
 */
export function useInvestCallback(pool: Pool | undefined, amount: string, token?: FungibleTokenDetailed) {
    const poolV1Contract = useDHedgePoolV1Contract(pool?.address ?? '')
    const poolV2Contract = useDHedgePoolV2Contract(pool?.address ?? '')

    const account = useAccount()
    const [investState, setInvestState] = useTransactionState()

    const investCallback = useCallback(async () => {
        if (!token || !poolV1Contract || !poolV2Contract) {
            setInvestState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setInvestState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
        }

        const deposit = () => {
            return pool?.poolType === PoolType.v1
                ? poolV1Contract.methods.deposit(amount)
                : poolV2Contract.methods.deposit(token.address, amount)
        }

        const estimatedGas = await deposit()
            .estimateGas(config)
            .catch((error) => {
                setInvestState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            const promiEvent = deposit().send({
                ...config,
                gas: estimatedGas,
            })
            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setInvestState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setInvestState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [pool, account, amount, token])

    const resetCallback = useCallback(() => {
        setInvestState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [investState, investCallback, resetCallback] as const
}
