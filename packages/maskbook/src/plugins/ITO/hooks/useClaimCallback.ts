import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import type { TransactionRequest } from '@ethersproject/providers'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import { addGasMargin } from '../../../web3/helpers'
import { useChainId } from '../../../web3/hooks/useChainState'
import { StageType } from '../../../web3/types'
import { useMaskITO_Contract } from '../contracts/useMaskITO_Contract'
import { watchTransaction } from '../../../web3/helpers/transaction'

export function useClaimCallback() {
    const account = useAccount()
    const chainId = useChainId()
    const MaskITO_Contract = useMaskITO_Contract()
    const [claimState, setClaimState] = useTransactionState()

    const claimCallback = useCallback(async () => {
        if (!MaskITO_Contract) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: TransactionRequest = {
            from: account,
            to: MaskITO_Contract.options.address,
            value: '0',
        }

        // step 1: estimate gas
        const estimatedGas = await MaskITO_Contract.estimateGas.claim().catch((error: Error) => {
            setClaimState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // step 2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const transaction = await MaskITO_Contract.claim({
                gasLimit: addGasMargin(new BigNumber(estimatedGas)).toString(),
            })

            for await (const stage of watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.RECEIPT:
                        setClaimState({
                            type: TransactionStateType.CONFIRMED,
                            no: 0,
                            receipt: stage.receipt,
                        })
                        break
                    case StageType.CONFIRMATION:
                        setClaimState({
                            type: TransactionStateType.CONFIRMED,
                            no: stage.no,
                            receipt: stage.receipt,
                        })
                        resolve()
                        break
                    case StageType.ERROR:
                        setClaimState({
                            type: TransactionStateType.FAILED,
                            error: stage.error,
                        })
                        reject(stage.error)
                        break
                }
            }
        })
    }, [account, chainId, MaskITO_Contract])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
