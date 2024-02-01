import { compact } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EVMNetworkResolver } from '@masknet/web3-providers'
import { ChainId, type NetworkType } from '@masknet/web3-shared-evm'
import { type RedPacketJSONPayload, RedPacketStatus } from '@masknet/web3-providers/types'
import { useAvailability } from './useAvailability.js'
import { useQuery } from '@tanstack/react-query'
import { RedPacketRPC } from '../../messages.js'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useSignedMessage } from './useSignedMessage.js'
import { usePlatformType } from './usePlatformType.js'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload) {
    const parsedChainId =
        payload.token?.chainId ??
        EVMNetworkResolver.networkChainId((payload.network ?? '') as NetworkType) ??
        ChainId.Mainnet

    const asyncResult = useAvailability(payload.rpid, payload.contract_address, payload.contract_version, {
        account,
        chainId: parsedChainId,
    })

    const author = usePostInfoDetails.author()
    const platform = usePlatformType()
    const signedMsg = useSignedMessage({
        account,
        contractVersion: payload.contract_version,
        password: payload.password,
        rpid: payload.rpid,
        profile: platform ? { platform, profileId: author?.userId || '' } : undefined,
    })
    const { data: password = signedMsg } = useQuery({
        queryKey: ['red-packet', 'password', payload.txid],
        queryFn: async () => {
            const record = await RedPacketRPC.getRedPacketRecord(payload.txid)
            return record?.password
        },
    })

    const availability = asyncResult.value

    if (!availability)
        return {
            ...asyncResult,
            payload,
            computed: {
                canClaim: false,
                canRefund: false,
                listOfStatus: [] as RedPacketStatus[],
            },
        }
    const isEmpty = availability.balance === '0'
    const isExpired = availability.expired
    const isClaimed = availability.claimed_amount !== '0'
    const isRefunded = isEmpty && availability.claimed < availability.total
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)
    const isPasswordValid = !!(password && password !== 'PASSWORD INVALID')
    return {
        ...asyncResult,
        computed: {
            canClaim: !isExpired && !isEmpty && !isClaimed && isPasswordValid,
            canRefund: isExpired && !isEmpty && isCreator,
            canSend: !isEmpty && !isExpired && !isRefunded && isCreator,
            isPasswordValid,
            listOfStatus: compact([
                isClaimed ? RedPacketStatus.claimed : undefined,
                isEmpty ? RedPacketStatus.empty : undefined,
                isRefunded ? RedPacketStatus.refunded : undefined,
                isExpired ? RedPacketStatus.expired : undefined,
            ]),
        },
    }
}
