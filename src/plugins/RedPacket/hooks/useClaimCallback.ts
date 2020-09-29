import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'

export function useClaimCallback(id?: string, password?: string) {
    const account = useAccount()
    const [claimState, setClaimState] = useTransactionState()
    const redPacketContract = useRedPacketContract()

    const claimCallback = useCallback(async () => {
        if (!redPacketContract || !id || !password) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: redPacketContract.options.address,
        }
        const params: Parameters<typeof redPacketContract['methods']['claim']> = [
            id,
            password,
            account,
            Web3Utils.sha3(account)!,
        ]

        // step 1: estimate gas
        const estimatedGas = await redPacketContract.methods
            .claim(...params)
            .estimateGas()
            .catch((error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        console.log('DEBUG: claimCallback')
        console.log({
            config,
            params,
            estimatedGas,
        })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            redPacketContract.methods.claim(...params).send(
                {
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                },
                (error, hash) => {
                    if (error) {
                        setClaimState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    } else {
                        setClaimState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    }
                },
            )
        })
    }, [id, password, account, redPacketContract])

    return [claimState, claimCallback] as const
}
