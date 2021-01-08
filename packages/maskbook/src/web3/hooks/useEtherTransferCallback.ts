import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import Services, { ServicesWithProgress } from '../../extension/service'
import { toHex } from 'web3-utils'
import { StageType } from '../../utils/promiEvent'
import type { TransactionConfig } from 'web3-core'
import { useChainId } from './useChainState'
import { addGasMargin } from '../helpers'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { EthereumAddress } from 'wallet.ts'

export function useEtherTransferCallback(amount?: string, recipient?: string, memo?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(async () => {
        if (!account || !recipient || !amount || new BigNumber(amount).isZero()) {
            setTransferState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // error: invalid recipient address
        if (!EthereumAddress.isValid(recipient)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid recipient address'),
            })
            return
        }

        // error: insufficent balance
        const balance = await Services.Ethereum.getBalance(account, chainId)

        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Insufficent balance'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setTransferState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: TransactionConfig = {
            from: account,
            to: recipient,
            value: amount,
            data: memo ? toHex(memo) : undefined,
        }

        // step 1: estimate gas
        const estimatedGas = await Services.Ethereum.estimateGas(config, chainId)
        const iterator = ServicesWithProgress.sendTransaction(account, {
            // the esitmated gas limit is too low with arbitrary message to be encoded as data
            gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
            ...config,
        })

        // step 2: blocking
        try {
            for await (const stage of iterator) {
                switch (stage.type) {
                    case StageType.RECEIPT:
                        setTransferState({
                            type: TransactionStateType.CONFIRMED,
                            no: 0,
                            receipt: stage.receipt,
                        })
                        break
                    case StageType.CONFIRMATION:
                        setTransferState({
                            type: TransactionStateType.CONFIRMED,
                            no: stage.no,
                            receipt: stage.receipt,
                        })
                        break
                }
            }
        } catch (error) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error,
            })
        }
    }, [account, amount, chainId, recipient, memo])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
