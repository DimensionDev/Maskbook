import { useAsyncRetry } from 'react-use'
import { useNftRedPacketContract } from './useNftRedPacketContract'

export function useAvailabilityNftRedPacket(id: string, from: string) {
    const nftRedPacketContract = useNftRedPacketContract()
    return useAsyncRetry(async () => {
        if (!id || !nftRedPacketContract) return null
        const availability = await nftRedPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })

        const result = await nftRedPacketContract.methods.check_erc721_remain_ids(id).call({
            // check availability is ok w/o account
            from,
        })

        const isClaimed = availability.claimed_id !== '0'
        const totalAmount = result.erc721_token_ids.length
        const claimedAmount = Number(result.bit_status)
            .toString(2)
            .split('')
            .reduce((acc, cur) => {
                if (cur === '1') return acc + 1
                return acc
            }, 0)
        const isClaimedAll = totalAmount === claimedAmount
        const isCompleted = isClaimedAll && !isClaimed
        const isEnd = isCompleted || availability.expired

        return { isClaimed, totalAmount, claimedAmount, isClaimedAll, isCompleted, isEnd, ...availability }
    }, [id, from, nftRedPacketContract])
}
