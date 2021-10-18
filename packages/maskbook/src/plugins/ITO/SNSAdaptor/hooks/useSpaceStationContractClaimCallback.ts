import { useSpaceStationContract } from './useSpaceStationContract'
import {
    useAccount,
    useSpaceStationGalaxyConstants,
    useTransactionState,
    TransactionStateType,
    TransactionEventType,
} from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import type { CampaignInfo } from '../../types'
import type { SpaceStationGalaxy } from '@masknet/web3-contracts/types/SpaceStationGalaxy'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { getAccountClaimSignature, mutationParticipate } from '../../Worker/apis/spaceStationGalaxy'
import Services from '../../../../extension/service'

export function useSpaceStationContractClaimCallback(campaignInfo: CampaignInfo) {
    const account = useAccount()
    const contract = useSpaceStationContract()
    const { CONTRACT_ADDRESS } = useSpaceStationGalaxyConstants()
    const [claimState, setClaimState] = useTransactionState()

    const claimCallback = useCallback(async () => {
        if (!CONTRACT_ADDRESS || !contract || !campaignInfo) {
            setClaimState({ type: TransactionStateType.UNKNOWN })
            return
        }

        // start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        let useSignature = ''
        try {
            useSignature = await Services.Ethereum.personalSign(
                `${campaignInfo.name}

${campaignInfo.description}`,
                account,
            )
        } catch (error) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Not allowed to claim.'),
            })
        }

        const { allow, signature, verifyIDs, nftCoreAddress, powahs } = await getAccountClaimSignature(
            useSignature,
            account,
            campaignInfo.chain,
            campaignInfo.id,
        )

        if (!allow) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Not allowed to claim.'),
            })
        }
        const params = [campaignInfo.id, nftCoreAddress, verifyIDs[0], powahs[0], signature] as Parameters<
            SpaceStationGalaxy['methods']['claim']
        >
        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await contract.methods
                .claim(...params)
                .estimateGas({ from: account })
                .catch((error) => {
                    setClaimState({ type: TransactionStateType.FAILED, error })
                    throw error
                }),
        }
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = contract.methods.claim(...params).send(config as NonPayableTx)

            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, async (hash) => {
                    setClaimState({
                        type: TransactionStateType.HASH,
                        hash,
                    })

                    const participated = await mutationParticipate(
                        useSignature,
                        account,
                        campaignInfo.chain,
                        campaignInfo.id,
                        hash,
                        verifyIDs,
                    )

                    if (!participated) {
                        setClaimState({
                            type: TransactionStateType.FAILED,
                            error: new Error('Failed to claim'),
                        })
                    }
                })
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setClaimState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, campaignInfo, setClaimState, Services, CONTRACT_ADDRESS, contract, campaignInfo.id])

    const resetCallback = useCallback(() => {}, [setClaimState])

    return [claimState, claimCallback, resetCallback] as const
}
