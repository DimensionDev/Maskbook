import { compact } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EVMNetworkResolver } from '@masknet/web3-providers'
import { ChainId, type NetworkType } from '@masknet/web3-shared-evm'
import { type RedPacketJSONPayload, RedPacketStatus } from '@masknet/web3-providers/types'
import { useAvailability } from './useAvailability.js'
import { useQuery } from '@tanstack/react-query'
import { RedPacketRPC } from '../../messages.js'

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

    const { data: password = payload.password } = useQuery({
        queryKey: ['red-packet', 'password', payload.txid],
        queryFn: async () => {
            const record = await RedPacketRPC.getRedPacketRecord(payload.txid)
            return record?.password
        },
    })

    const result = asyncResult
    const availability = result.value

    if (!availability)
        return {
            ...asyncResult,
            payload,
            password,
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
        password,
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
