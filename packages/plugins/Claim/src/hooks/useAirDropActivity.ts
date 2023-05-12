import { last } from 'lodash-es'
import { utils } from 'ethers'
import { MerkleTree } from 'merkletreejs'
import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Airdrop } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useAirDropActivity(chainId: ChainId) {
    const { account } = useChainContext()

    return useQuery({
        queryKey: ['airdrop-activity', chainId, account],
        queryFn: async () => {
            const result = await Airdrop.getActivity(chainId, account)
            if (!result) return
            const { claimers, startTime, endTime, ...rest } = result

            const claimerList = Object.entries(claimers)
            const claimer = claimerList.find(([address]) => isSameAddress(address, account))
            const airdropList = claimerList.map(([address, amount]) => {
                return utils.keccak256(utils.solidityPack(['address', 'uint256'], [address, utils.parseEther(amount)]))
            })
            const merkleTree = new MerkleTree(airdropList, utils.keccak256, { sortPairs: true })
            const amount = claimer ? last(claimer) : undefined
            const leaf = amount
                ? utils.keccak256(utils.solidityPack(['address', 'uint256'], [account, utils.parseEther(amount)]))
                : undefined

            const merkleProof = leaf ? merkleTree.getHexProof(leaf) : undefined

            return {
                ...rest,
                isEligible: !!claimer,
                startTime: secondsToMilliseconds(Number(startTime)),
                endTime: secondsToMilliseconds(Number(endTime)),
                amount: claimer ? last(claimer) : undefined,
                chainId,
                merkleProof,
            }
        },
    })
}
