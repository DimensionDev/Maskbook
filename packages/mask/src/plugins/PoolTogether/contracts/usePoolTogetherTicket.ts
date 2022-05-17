import type { AbiItem } from 'web3-utils'
import PoolTogetherTicketABI from '@masknet/web3-contracts/abis/PoolTogetherTicket.json'
import type { PoolTogetherTicket } from '@masknet/web3-contracts/types/PoolTogetherTicket'
import { useChainId, useContracts } from '@masknet/web3-shared-evm'

export function usePoolTogetherTicketContracts(addresses: string[]) {
    const chainId = useChainId()
    return useContracts<PoolTogetherTicket>(chainId, addresses, PoolTogetherTicketABI as AbiItem[])
}
