import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import Services from '../../extension/service'
import { useChainId } from './useChainState'
import { addGasMargin } from '../helpers'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { EthereumAddress } from 'wallet.ts'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'
import type { TransactionRequest } from '@ethersproject/providers'
import { toUtf8Bytes } from 'ethers/lib/utils'
import { StageType } from '../types'

export function useEtherTransferCallback(amount?: string, recipient?: string, memo?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const [transferState, setTransferState] = useTransactionState()
    const PROVIDER_ADDRESS_LIST = useConstant(CONSTANTS, 'PROVIDER_ADDRESS_LIST')

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

        if (new BigNumber(amount).isGreaterThan(balance)) {
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

        const config: TransactionRequest = {
            from: account,
            to: recipient,
            value: amount,

            // FIXME:
            // the ether tx will be canceled by quicknode's holy-water provider.
            // @ts-ignore
            __provider_url__: PROVIDER_ADDRESS_LIST[1],
        }

        // encode memo as data
        if (memo) config.data = toUtf8Bytes(memo)

        // step 1: estimate gas
        const transaction = await Services.Ethereum.sendTransaction(account, {
            // the esitmated gas limit is too low with arbitrary message to be encoded as data (increase 20% gas limit)
            gasLimit: addGasMargin(new BigNumber(21000), 2000).toFixed(),
            ...config,
        })

        // step 2: blocking
        try {
            for await (const stage of Services.Ethereum.watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.TRANSACTION_HASH:
                        setTransferState({
                            type: TransactionStateType.HASH,
                            hash: stage.hash,
                        })
                        break
                    case StageType.RECEIPT:
                        setTransferState({
                            type: TransactionStateType.HASH,
                            hash: stage.receipt.transactionHash,
                        })
                        break
                    case StageType.CONFIRMATION:
                        setTransferState({
                            type: TransactionStateType.HASH,
                            hash: stage.receipt.transactionHash,
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
    }, [account, amount, chainId, recipient, memo, PROVIDER_ADDRESS_LIST])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
