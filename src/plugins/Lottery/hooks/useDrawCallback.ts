import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useLotteryContract } from '../contracts/useLotteryContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'

export function useDrawCallback(id?: string) {
    const account = useAccount()
    const [drawState, setDrawState] = useTransactionState()
    const lotteryContract = useLotteryContract()

    const drawCallback = useCallback(async () => {
        if (!lotteryContract || !id) {
            setDrawState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setDrawState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: lotteryContract.options.address,
        }
        const params: Parameters<typeof lotteryContract['methods']['draw']> = [id]

        // step 1: estimate gas
        const estimatedGas = await lotteryContract.methods
            .draw(...params)
            .estimateGas(config)
            .catch((error: Error) => {
                setDrawState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            lotteryContract.methods.draw(...params).send(
                {
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                },
                (error: Error, hash: string) => {
                    if (error) {
                        setDrawState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    } else {
                        setDrawState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    }
                },
            )
        })
    }, [id, lotteryContract])

    return [drawState, drawCallback] as const
}
