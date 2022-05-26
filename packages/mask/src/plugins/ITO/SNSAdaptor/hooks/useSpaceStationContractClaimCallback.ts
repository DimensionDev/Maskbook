import type { SpaceStationGalaxy } from '@masknet/web3-contracts/types/SpaceStationGalaxy'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType, useAccount, useSpaceStationGalaxyConstants } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import Services from '../../../../extension/service'
import type { CampaignInfo } from '../../types'
import { getAccountClaimSignature, mutationParticipate } from '../../Worker/apis/spaceStationGalaxy'
import { useSpaceStationContract } from './useSpaceStationContract'

export function useSpaceStationContractClaimCallback(campaignInfo: CampaignInfo) {
    const account = useAccount()
    const spaceStationContract = useSpaceStationContract()
    const { CONTRACT_ADDRESS } = useSpaceStationGalaxyConstants()

    return useAsyncFn(async () => {
        if (!CONTRACT_ADDRESS || !spaceStationContract || !campaignInfo) {
            return
        }

        const useSignature = await Services.Ethereum.personalSign(
            `${campaignInfo.name}

${campaignInfo.description}`,
            account,
        )

        const { allow, signature, verifyIDs, nftCoreAddress, powahs } = await getAccountClaimSignature(
            useSignature,
            account,
            campaignInfo.chain,
            campaignInfo.id,
        )

        if (!allow) {
            throw new Error('Not allowed to claim.')
        }
        const params = [campaignInfo.id, nftCoreAddress, verifyIDs[0], powahs[0], signature] as Parameters<
            SpaceStationGalaxy['methods']['claim']
        >
        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await spaceStationContract.methods.claim(...params).estimateGas({ from: account }),
        }
        return new Promise<string>(async (resolve, reject) => {
            spaceStationContract.methods
                .claim(...params)
                .send(config as NonPayableTx)
                .on(TransactionEventType.TRANSACTION_HASH, async (hash) => {
                    const participated = await mutationParticipate(
                        useSignature,
                        account,
                        campaignInfo.chain,
                        campaignInfo.id,
                        hash,
                        verifyIDs,
                    )

                    if (!participated) {
                        throw new Error('Failed to claim')
                    }
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, campaignInfo, CONTRACT_ADDRESS, spaceStationContract])
}
