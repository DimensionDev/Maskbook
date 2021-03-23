import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useCOTM_TokenContract } from '../contracts/useCOTM_TokenContract'

export function useMintCallback(from: string) {
    const [mintState, setMintState] = useTransactionState()
    const COTM_TokenContract = useCOTM_TokenContract()

    const mintCallback = useCallback(async () => {
        if (!COTM_TokenContract) {
            setMintState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setMintState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: check remaining
        const remaining = await COTM_TokenContract.methods.check_availability().call()
        if (Number.parseInt(remaining || '0', 10) <= 0) {
            setMintState({
                type: TransactionStateType.FAILED,
                error: new Error('There is none NTF token left.'),
            })
            return
        }

        // step 2-1: estimatedGas
        const config: Tx = {
            from,
            to: COTM_TokenContract.options.address,
        }
        const estimatedGas = await COTM_TokenContract.methods
            .mintToken(from)
            .estimateGas(config)
            .catch((error) => {
                setMintState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2-2: blocking
        return new Promise<string>((resolve, reject) => {
            const onSucceed = (hash: string) => {
                setMintState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve(hash)
            }
            const onFailed = (error: Error) => {
                setMintState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            COTM_TokenContract.methods.mintToken(from).send(
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
    }, [from, COTM_TokenContract])

    const resetCallback = useCallback(() => {
        setMintState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [mintState, mintCallback, resetCallback] as const
}
