import { useCallback } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { GasConfig, TransactionEventType } from '../types'
import { isSameAddress } from '../utils'
import { useAccount } from './useAccount'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useNonce } from './useNonce'
import { useGasPrice } from './useGasPrice'

export function useERC721TokenTransferCallback(address?: string) {
    const account = useAccount()
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const erc721Contract = useERC721TokenContract(address)
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(
        async (tokenId?: string, recipient?: string, gasConfig?: GasConfig) => {
            if (!account || !recipient || !tokenId || !erc721Contract) {
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

            // error: invalid ownership
            const ownerOf = await erc721Contract.methods.ownerOf(tokenId).call()

            if (!ownerOf || !isSameAddress(ownerOf, account) || isSameAddress(ownerOf, recipient)) {
                setTransferState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Invalid ownership'),
                })
                return
            }

            // start waiting for provider to confirm tx
            setTransferState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            // estimate gas and compose transaction
            const config = {
                from: account,
                nonce,
                ...(gasConfig ?? {
                    gas: await erc721Contract.methods
                        .transferFrom(account, recipient, tokenId)
                        .estimateGas({
                            from: account,
                        })
                        .catch((error) => {
                            setTransferState({
                                type: TransactionStateType.FAILED,
                                error,
                            })
                            throw error
                        }),
                    gasPrice,
                }),
            }

            // send transaction and wait for hash
            return new Promise<string>(async (resolve, reject) => {
                erc721Contract.methods
                    .transferFrom(account, recipient, tokenId)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                        setTransferState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        setTransferState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    })
            })
        },
        [gasPrice, nonce, account, erc721Contract],
    )

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
