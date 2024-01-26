import { compact } from 'lodash-es'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { type NftRedPacketJSONPayload, RedPacketStatus } from '@masknet/web3-providers/types'
import { useAvailabilityNftRedPacket } from './useAvailabilityNftRedPacket.js'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useNftAvailabilityComputed(account: string, payload: NftRedPacketJSONPayload) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: availability } = useAvailabilityNftRedPacket(payload?.rpid, account, chainId)

    if (!availability) {
        return {
            canClaim: false,
            listOfStatus: EMPTY_LIST as RedPacketStatus[],
        }
    }

    const isEmpty = availability.remaining === 0
    const isExpired = availability.expired
    const isClaimed = availability.isClaimed
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)

    const isPasswordValid = !!payload.password && payload.password !== 'PASSWORD INVALID'
    const isClaimable = !isExpired && !isEmpty && !isClaimed
    const isSendable = !isEmpty && !isExpired && isCreator
    return {
        canClaim: isClaimable && isPasswordValid,
        canSend: isSendable,
        password: payload.password,
        isPasswordValid,
        listOfStatus: compact([
            isClaimed ? RedPacketStatus.claimed : undefined,
            isEmpty ? RedPacketStatus.empty : undefined,
            isExpired ? RedPacketStatus.expired : undefined,
        ]),
    }
}
