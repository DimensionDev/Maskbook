import { last } from 'lodash-es'
// cspell:disable-next-line
import { MerkleTree } from 'merkletreejs'
import { secondsToMilliseconds } from 'date-fns'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Airdrop } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, formatEtherToWei } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { encodePacked, keccak256, type Hex } from 'viem'
import { toHex } from '@masknet/shared-base'

export function useAirDropActivity(chainId: ChainId) {
    const { account } = useChainContext()

    return useQuery({
        queryKey: ['airdrop-activity', chainId, account],
        queryFn: async () => {
            const result = await Airdrop.getActivity(chainId, account)
            if (!result) return null
            const { claimers, startTime, endTime, ...rest } = result

            const claimerList = Object.entries(claimers)
            const claimer = claimerList.find(([address]) => isSameAddress(address, account))
            const airdropList = claimerList.map(([address, amount]) => {
                return encodePacked(
                    ['address', 'uint256'],
                    [address as Hex, BigInt(formatEtherToWei(amount).toFixed(0))],
                )
            })
            const merkleTree = new MerkleTree(airdropList, (value: Buffer) => keccak256(toHex(value)), {
                sortPairs: true,
            })
            const amount = claimer ? last(claimer) : undefined
            const leaf =
                amount ?
                    keccak256(
                        encodePacked(
                            ['address', 'uint256'],
                            [account as Hex, BigInt(formatEtherToWei(amount).toFixed(0))],
                        ),
                    )
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
