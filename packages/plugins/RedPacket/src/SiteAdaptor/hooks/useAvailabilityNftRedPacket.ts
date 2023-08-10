import { useAsyncRetry } from 'react-use'
import { BigNumber } from 'bignumber.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'

export function useAvailabilityNftRedPacket(id: string, from: string, chainId?: ChainId) {
    const nftRedPacketContract = useNftRedPacketContract(chainId)
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
        const bits = new BigNumber(result.bit_status).toString(2).split('')
        const claimedAmount = bits.filter((bit) => bit === '1').length
        const isClaimedAll = totalAmount === claimedAmount
        const isCompleted = isClaimedAll && !isClaimed
        const isEnd = isCompleted || availability.expired

        const bitStatusList = bits.reverse().map((bit) => bit === '1')

        return {
            isClaimed,
            totalAmount,
            claimedAmount,
            remaining: totalAmount - claimedAmount,
            isClaimedAll,
            isCompleted,
            isEnd,
            bitStatusList,
            ...availability,
        }
    }, [id, from, nftRedPacketContract])
}
