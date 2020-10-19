import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'
import Services from '../../../extension/service'

export function useClaimCallback(from: string, id?: string, password?: string) {
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
            from,
            to: redPacketContract.options.address,
        }
        const params: Parameters<typeof redPacketContract['methods']['claim']> = [
            id,
            password,
            from,
            Web3Utils.sha3(from)!,
        ]

        // step 1: estimate gas
        const estimatedGas = await redPacketContract.methods
            .claim(...params)
            .estimateGas(config)
            .catch((error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2-1: blocking
        return new Promise<string>((resolve, reject) => {
            const onSucceed = (hash: string) => {
                setClaimState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve(hash)
            }
            const onFailed = (error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            redPacketContract.methods.claim(...params).send(
                {
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                },
                async (error, hash) => {
                    if (hash) onSucceed(hash)
                    // claim by server
                    else if (error?.message.includes('insufficient funds for gas')) {
                        Services.Plugin.invokePlugin('maskbook.red_packet', 'claimRedPacket', from, id, password)
                            .then(({ claim_transaction_hash }) => onSucceed(claim_transaction_hash))
                            .catch(onFailed)
                    } else if (error) onFailed(error)
                },
            )
        })
    }, [id, password, from, redPacketContract])

    return [claimState, claimCallback] as const
}
