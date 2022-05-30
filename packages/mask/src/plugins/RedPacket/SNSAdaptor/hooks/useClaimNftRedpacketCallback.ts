import { useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { TransactionStateType, TransactionEventType } from '@masknet/web3-shared-evm'
import { useNftRedPacketContract } from './useNftRedPacketContract'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket'
import { useTransactionState } from '@masknet/plugin-infra/web3-evm'

const EXTRA_GAS_PER_NFT = 335

export function useClaimNftRedpacketCallback(id: string, totalAmount: number | undefined, signedMsg: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const nftRedPacketContract = useNftRedPacketContract()
    const [claimState, setClaimState] = useTransactionState()
    const claimCallback = useCallback(async () => {
        if (!nftRedPacketContract || !id || !signedMsg || !account || !totalAmount) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        type MethodParameters = Parameters<NftRedPacket['methods']['claim']>

        const params: MethodParameters = [id, signedMsg, account]

        const config = {
            from: account,
            gas:
                (await nftRedPacketContract.methods
                    .claim(...params)
                    .estimateGas({ from: account })
                    .catch((error) => {
                        setClaimState({ type: TransactionStateType.FAILED, error })
                        throw error
                    })) +
                EXTRA_GAS_PER_NFT * totalAmount,
            chainId,
        }

        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        return new Promise<void>(async (resolve, reject) => {
            nftRedPacketContract.methods
                .claim(...params)
                .send(config as NonPayableTx)
                .on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    if (claimState.type === TransactionStateType.CONFIRMED) return

                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error: Error) => {
                    setClaimState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [id, signedMsg, account, chainId, totalAmount, claimState])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [account])

    return [claimState, claimCallback, resetCallback] as const
}
