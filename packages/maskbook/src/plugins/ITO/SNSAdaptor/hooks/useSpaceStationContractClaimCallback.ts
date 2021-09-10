import { useSpaceStationContract } from './useSpaceStationContract'
import {
    useAccount,
    useSpaceStationGalaxyConstants,
    useTransactionState,
    useGasPrice,
    TransactionStateType,
    TransactionEventType,
} from '@masknet/web3-shared'
import { useCallback } from 'react'
import type { CampaignInfo } from '../../types'
import type { SpaceStationGalaxy } from '@masknet/web3-contracts/types/SpaceStationGalaxy'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { CAMPAIGN_ID } from '../../Worker/apis/spaceStationGalaxy'
import { PluginITO_RPC } from '../../messages'
import Services from '../../../../extension/service'

export function useSpaceStationContractClaimCallback(campaignInfo: CampaignInfo) {
    const account = useAccount()
    const gasPrice = useGasPrice()
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

        const useSignature = await Services.Ethereum.personalSign(
            `${campaignInfo.name}

${campaignInfo.description}`,
            account,
        )

        const { allow, signature, verifyIDs, nftCoreAddress, powahs } = await PluginITO_RPC.getAccountClaimSignature(
            useSignature,
            account,
            campaignInfo.chain,
        )

        if (!allow) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Not allowed to claim.'),
            })
        }
        const params = [CAMPAIGN_ID, nftCoreAddress, verifyIDs[0], powahs[0], signature] as Parameters<
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

                    const participated = await PluginITO_RPC.mutationParticipate(
                        useSignature,
                        account,
                        campaignInfo.chain,
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
    }, [account, campaignInfo, setClaimState, Services, CONTRACT_ADDRESS, contract, CAMPAIGN_ID])

    const resetCallback = useCallback(() => {}, [setClaimState])

    return [claimState, claimCallback, resetCallback] as const
}
