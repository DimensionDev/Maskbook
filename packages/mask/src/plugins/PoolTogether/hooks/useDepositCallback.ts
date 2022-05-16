import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { TransactionStateType, TransactionEventType, ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { useTransactionState } from '@masknet/plugin-infra/web3-evm'

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
    token?: FungibleToken<ChainId, SchemaType>,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const poolContract = usePoolTogetherPoolContract(chainId, address)
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
            value: new BigNumber(token.schema === SchemaType.Native ? amount : 0).toFixed(),
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
            poolContract.methods
                .depositTo(account, amount, controlledToken, referrer)
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
    }, [address, account, amount, token, referrer, controlledToken])

    const resetCallback = useCallback(() => {
        setDepositState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [depositState, depositCallback, resetCallback] as const
}
