import { last } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
// cspell:disable-next-line
import { MerkleTree } from 'merkletreejs'
import { secondsToMilliseconds } from 'date-fns'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Airdrop } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, formatEtherToWei, pack } from '@masknet/web3-shared-evm'
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
                return web3_utils.keccak256(pack(['address', 'uint256'], [address, formatEtherToWei(amount)]))
            })
            const merkleTree = new MerkleTree(airdropList, web3_utils.keccak256, { sortPairs: true })
            const amount = claimer ? last(claimer) : undefined
            const leaf =
                amount ?
                    web3_utils.keccak256(pack(['address', 'uint256'], [account, formatEtherToWei(amount)]))
                :   undefined

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
