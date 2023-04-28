import { useChainContext } from '@masknet/web3-hooks-base'
import { AirDrop } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { last } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { utils } from 'ethers'
import { MerkleTree } from 'merkletreejs'

export function useAirDropActivity(chainId: ChainId) {
    const { account } = useChainContext()

    return useAsyncRetry(async () => {
        if (!account) return
        const result = await AirDrop.getActivity(chainId, account)
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
            startTime: Number(startTime) * 1000,
            endTime: Number(endTime) * 1000,
            amount: claimer ? last(claimer) : undefined,
            chainId,
            merkleProof,
        }
    }, [account])
}
