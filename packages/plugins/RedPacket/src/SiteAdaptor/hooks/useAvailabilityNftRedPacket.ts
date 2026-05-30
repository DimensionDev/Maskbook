import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { createNftRedpacketContract } from './useNftRedPacketContract.js'

export function useAvailabilityNftRedPacket(id: HexString | '', from: HexString | '', chainId?: ChainId) {
    return useQuery({
        queryKey: ['nft-redpacket', 'availability', chainId, from, id],
        queryFn: async () => {
            const nftRedPacketContract = createNftRedpacketContract(chainId)
            if (!id || !nftRedPacketContract) return null
            const [token_address, balance, total_pkts, expired, claimed_id, bit_status] =
                await nftRedPacketContract.read.check_availability([id], {
                    // check availability is ok w/o account
                    account: from || undefined,
                })

            const [bit_status2, erc721_token_ids] = await nftRedPacketContract.read.check_erc721_remain_ids([id], {
                // check availability is ok w/o account
                account: from || undefined,
            })

            const isClaimed = claimed_id !== 0n
            const totalAmount = erc721_token_ids.length
            const bits = bit_status2.toString(2).split('')
            const claimedAmount = bits.filter((bit) => bit === '1').length
            const isClaimedAll = totalAmount === claimedAmount
            const isCompleted = isClaimedAll && !isClaimed
            const isEnd = isCompleted || expired

            const bitStatusList = bits.reverse().map((bit) => bit === '1')

            return {
                isClaimed,
                canClaim: !isClaimed && !isEnd,
                totalAmount,
                claimedAmount,
                remaining: totalAmount - claimedAmount,
                isClaimedAll,
                isEmpty: isClaimedAll,
                isCompleted,
                isEnd,
                bitStatusList,
                token_address,
                balance,
                total_pkts,
                expired,
                bit_status,
                claimed_id: claimed_id === 0n ? undefined : claimed_id,
            }
        },
    })
}
