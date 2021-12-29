import {
    useTransactionState,
    useAccount,
    useChainId,
    TransactionStateType,
    TransactionEventType,
} from '@masknet/web3-shared-evm'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import { EthereumAddress } from 'wallet.ts'
import { useCallback } from 'react'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket'
import { useNftRedPacketContract } from './useNftRedPacketContract'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'

export function useCreateNftRedpacketCallback(
    duration: number,
    message: string,
    name: string,
    contractAddress: string,
    tokenIdList: string[],
) {
    const account = useAccount()
    const chainId = useChainId()
    const [createState, setCreateState] = useTransactionState()
    const nftRedPacketContract = useNftRedPacketContract()
    const createCallback = useCallback(
        async (publicKey: string) => {
            if (!nftRedPacketContract) {
                setCreateState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            if (!contractAddress || !EthereumAddress.isValid(contractAddress)) {
                setCreateState?.({
                    type: TransactionStateType.FAILED,
                    error: new Error('NFT contract is invalid'),
                })
                return
            }

            if (tokenIdList.length === 0) {
                setCreateState?.({
                    type: TransactionStateType.FAILED,
                    error: new Error('Require to send one nft token at least'),
                })
                return
            }

            setCreateState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            //#region check ownership
            type CheckMethodParameters = Parameters<NftRedPacket['methods']['check_ownership']>

            const checkParams: CheckMethodParameters = [tokenIdList, contractAddress]

            const isOwner = await nftRedPacketContract.methods.check_ownership(...checkParams).call({ from: account })

            if (!isOwner) {
                setCreateState?.({
                    type: TransactionStateType.FAILED,
                    error: new Error('Invalid ownership'),
                })
                return
            }

            //#endregion

            type FillMethodParameters = Parameters<NftRedPacket['methods']['create_red_packet']>

            const params: FillMethodParameters = [
                publicKey,
                duration,
                Web3Utils.sha3(Math.random().toString())!,
                message,
                name,
                contractAddress,
                tokenIdList,
            ]

            const config = {
                from: account,
                gas: await nftRedPacketContract.methods
                    .create_red_packet(...params)
                    .estimateGas({ from: account })
                    .catch((error) => {
                        setCreateState({ type: TransactionStateType.FAILED, error })
                        throw error
                    }),
                chainId,
            }

            return new Promise<void>(async (resolve, reject) => {
                nftRedPacketContract.methods
                    .create_red_packet(...params)
                    .send(config as NonPayableTx)
                    // Note: DO NOT remove this event listener since it relates to password saving.
                    .on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                        setCreateState({
                            type: TransactionStateType.WAIT_FOR_CONFIRMING,
                            hash,
                        })
                    })
                    .on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                        setCreateState({
                            type: TransactionStateType.CONFIRMED,
                            no: 0,
                            receipt,
                        })
                        resolve()
                    })
                    .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                        setCreateState({
                            type: TransactionStateType.CONFIRMED,
                            no,
                            receipt,
                        })
                        resolve()
                    })
                    .on(TransactionEventType.ERROR, (error: Error) => {
                        setCreateState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    })
            })
        },
        [duration, message, name, contractAddress, tokenIdList, nftRedPacketContract, setCreateState, account, chainId],
    )
    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createState, createCallback, resetCallback] as const
}
