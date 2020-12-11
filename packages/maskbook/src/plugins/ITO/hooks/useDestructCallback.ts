import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { usePoolPayload } from './usePoolPayload'

export function useDestructCallback(id: string) {
    const account = useAccount()
    const ITO_Contract = useITO_Contract()

    const poolPayload = usePoolPayload(id)
    const [destructState, setDestructState] = useTransactionState()

    const destructCallback = useCallback(async () => {
        if (!ITO_Contract || !id || !poolPayload) {
            setDestructState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setDestructState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: ITO_Contract.options.address,
        }

        // step 1: estimate gas
        const estimatedGas = await ITO_Contract.methods
            .destruct(id)
            .estimateGas(config)
            .catch((error) => {
                setDestructState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2-1: blocking
        return new Promise<string>((resolve, reject) => {
            const onSucceed = (hash: string) => {
                setDestructState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve(hash)
            }
            const onFailed = (error: Error) => {
                setDestructState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            ITO_Contract.methods.destruct(id).send(
                {
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                },
                async (error, hash) => {
                    if (hash) onSucceed(hash)
                    else if (error) onFailed(error)
                },
            )
        })
    }, [id, poolPayload])

    const resetCallback = useCallback(() => {
        setDestructState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [destructState, destructCallback, resetCallback] as const
}
