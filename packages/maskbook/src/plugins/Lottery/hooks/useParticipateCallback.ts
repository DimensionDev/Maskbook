import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import { useLotteryContract } from '../contracts/useLotteryContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'

export function useParticipateCallback(id?: string, password?: string) {
    const account = useAccount()
    const [participateState, setParticipateState] = useTransactionState()
    const lotteryContract = useLotteryContract()

    const participateCallback = useCallback(async () => {
        if (!lotteryContract || !id || !password) {
            setParticipateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setParticipateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: lotteryContract.options.address,
        }
        const params: Parameters<typeof lotteryContract['methods']['participate']> = [
            id,
            password,
            account,
            Web3Utils.sha3(account)!,
        ]

        // step 1: estimate gas
        const estimatedGas = await lotteryContract.methods
            .participate(...params)
            .estimateGas(config)
            .catch((error: Error) => {
                setParticipateState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2-1: blocking
        return new Promise<string>((resolve, reject) => {
            const onSucceed = (hash: string) => {
                setParticipateState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve(hash)
            }
            const onFailed = (error: Error) => {
                setParticipateState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            lotteryContract.methods.participate(...params).send(
                {
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                },
                async (error: Error, hash: string) => {
                    if (hash) onSucceed(hash)
                    // claim by server
                    else if (error?.message.includes('insufficient funds for gas')) {
                        onFailed(error)
                    } else if (error) onFailed(error)
                },
            )
        })
    }, [id, password, account, lotteryContract])

    return [participateState, participateCallback] as const
}
