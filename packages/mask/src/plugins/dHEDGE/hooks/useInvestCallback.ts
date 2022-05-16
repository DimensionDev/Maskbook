import { useCallback } from 'react'
import {
    TransactionStateType,
    TransactionEventType,
    ChainId,
    SchemaType,
} from '@masknet/web3-shared-evm'
import { useDHedgePoolV1Contract, useDHedgePoolV2Contract } from '../contracts/useDHedgePool'
import { Pool, PoolType } from '../types'
import { FungibleToken, NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { useTransactionState } from '@masknet/plugin-infra/web3-evm'

/**
 * A callback for invest dhedge pool
 * @param pool the pool
 * @param amount
 * @param token
 */
export function useInvestCallback(pool: Pool | undefined, amount: string, token?: FungibleToken<ChainId, SchemaType>) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [investState, setInvestState] = useTransactionState()

    const poolV1Contract = useDHedgePoolV1Contract(chainId, pool?.address ?? '')
    const poolV2Contract = useDHedgePoolV2Contract(chainId, pool?.address ?? '')

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
            value: toFixed(token.schema === SchemaType.Native ? amount : 0),
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
            deposit()
                .send({
                    ...config,
                    gas: estimatedGas,
                })
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
