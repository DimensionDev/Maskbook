import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm'
import type { BaseConnectionOptions } from '@masknet/web3-providers/types'
import { EVMContract } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useRedPacketContract } from './useRedPacketContract.js'
import { useQuery } from '@tanstack/react-query'
import type { Hex } from 'viem'

export type RedPacketAvailability = {
    token_address: string
    balance: string
    total: string
    claimed: string
    expired: boolean
    claimed_amount: string
}

export function formatRedPacketAvailability(value: unknown): RedPacketAvailability | null {
    if (!Array.isArray(value)) return null
    const [tokenAddress, balance, total, claimed, expired, claimedAmountOrIfClaimed] = value
    return {
        token_address: String(tokenAddress ?? ''),
        balance: String(balance ?? '0'),
        total: String(total ?? '0'),
        claimed: String(claimed ?? '0'),
        expired: Boolean(expired),
        claimed_amount:
            typeof claimedAmountOrIfClaimed === 'boolean' ?
                claimedAmountOrIfClaimed ? '1'
                :   '0'
            :   String(claimedAmountOrIfClaimed ?? '0'),
    }
}

export function useAvailability(
    id: string,
    version: number,
    options?: BaseConnectionOptions<ChainId, ProviderType, Transaction>,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
    const redPacketContract = useRedPacketContract(chainId, version)
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    return useQuery({
        queryKey: ['red-packet', 'check-availability', chainId, version, id, account],
        queryFn: async () => {
            if (!id || !redPacketContract) return null
            return formatRedPacketAvailability(
                await EVMContract.readContract(redPacketContract, 'check_availability', [id as Hex], {
                    chainId,
                    // check availability is ok w/o account
                    from: account,
                }),
            )
        },
        refetchInterval(query) {
            const { data } = query.state
            if (!data) return 30_000
            if (data.expired || !data.balance) return false
            return 30_000
        },
    })
}
