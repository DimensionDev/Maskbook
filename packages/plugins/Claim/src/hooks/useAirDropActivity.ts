import { last } from 'lodash-es'
import { secondsToMilliseconds } from 'date-fns'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Airdrop } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, formatEtherToWei } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { concatHex, encodePacked, keccak256, type Address, type Hex } from 'viem'

function hashAirdropLeaf(address: string, amount: string) {
    return keccak256(
        encodePacked(['address', 'uint256'], [address as Address, BigInt(formatEtherToWei(amount).toFixed(0))]),
    )
}

function hashMerklePair(a: Hex, b: Hex) {
    const [left, right] = a.toLowerCase() <= b.toLowerCase() ? [a, b] : [b, a]
    return keccak256(concatHex([left, right]))
}

function getMerkleProof(leaves: Hex[], leaf: Hex) {
    let index = leaves.findIndex((x) => x.toLowerCase() === leaf.toLowerCase())
    if (index === -1) return []

    const proof: Hex[] = []
    let level = leaves

    while (level.length > 1) {
        const nextLevel: Hex[] = []

        for (let i = 0; i < level.length; i += 2) {
            const left = level[i]!
            const right = level[i + 1]

            if (!right) {
                if (i === index) index = nextLevel.length
                nextLevel.push(left)
                continue
            }

            if (i === index || i + 1 === index) {
                proof.push(i === index ? right : left)
                index = nextLevel.length
            }
            nextLevel.push(hashMerklePair(left, right))
        }

        level = nextLevel
    }

    return proof
}

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
            const airdropList = claimerList.map(([address, amount]) => hashAirdropLeaf(address, amount))
            const amount = claimer ? last(claimer) : undefined
            const leaf = amount ? hashAirdropLeaf(account, amount) : undefined

            const merkleProof = leaf ? getMerkleProof(airdropList, leaf) : undefined

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
