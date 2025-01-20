import { NetworkPluginID } from '@masknet/shared-base'
import { useAccount } from '@masknet/web3-hooks-base'
import { RedPacketStatus, type SolanaRedPacketJSONPayload } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { getRpProgram } from '../../helpers/getRpProgram.js'
import { minus } from '@masknet/web3-shared-base'
import { useClaimRecord } from './useClaimRecord.js'
import { useParseRedPacket } from '../../hooks/useParseRedPacket.js'

export function useSolanaAvailability(payload: SolanaRedPacketJSONPayload, chainId: number) {
    const account = useAccount(NetworkPluginID.PLUGIN_SOLANA)

    const { data, refetch: checkAvailability } = useQuery({
        queryKey: ['red-packet', 'solana-availability', payload.accountId, payload.network],
        queryFn: async () => {
            if (!payload.accountId) return null
            const program = await getRpProgram(payload.network)
            const result = await program.account.redPacket.fetch(payload.accountId)
            return result
        },
        refetchInterval(query) {
            const { data } = query.state
            if (!data) return 30_000
            const isExpired = data.duration.add(data.createTime).muln(1000).ltn(Date.now())
            const balance = minus(data.totalAmount.toString(), data.claimedAmount.toString()).toString()
            if (isExpired || !balance) return false
            return 30_000
        },
    })
    const parsed = useParseRedPacket()

    const { data: claimRecord } = useClaimRecord(account, payload.accountId, payload?.network ?? 'mainnet-beta')
    if (!data) {
        return {
            parsedChainId: chainId,
            availability: null,
            isExpired: false,
            computed: { canClaim: false, canRefund: false, listOfStatus: [] as RedPacketStatus[] },
            isEmpty: true,
            isClaimed: false,
            checkAvailability,
        }
    }
    const isExpired = data.duration.add(data.createTime).muln(1000).ltn(Date.now())
    const isEmpty = data.claimedAmount.gt(data.totalAmount)
    const isClaimed = !!claimRecord || !!parsed?.redpacket.isClaimed

    const availability = {
        token_address: data.tokenAddress.toBase58(),
        balance: minus(data.totalAmount.toString(), data.claimedAmount.toString()).toString(),
        total: data.totalAmount.toString(),
        claimed: data.claimedNumber.toString(),
        expired: isExpired,
        isEmpty,
        claimed_amount: data.claimedAmount.toString(),
        publicKey: data.pubkeyForClaimSignature,
        isClaimed,
    }
    const canClaim = !isExpired && !isEmpty && !isClaimed
    const canRefund = isExpired && !isEmpty && account === payload.sender.address
    const listOfStatus: RedPacketStatus[] = []
    if (isClaimed) listOfStatus.push(RedPacketStatus.claimed)
    if (isExpired) listOfStatus.push(RedPacketStatus.expired)
    if (isEmpty) listOfStatus.push(RedPacketStatus.empty)

    return {
        parsedChainId: chainId,
        availability,
        isExpired,
        computed: { canClaim, canRefund, listOfStatus },
        isEmpty: isEmpty || false,
        isClaimed,
        checkAvailability,
    }
}
