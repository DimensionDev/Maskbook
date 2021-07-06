import type { AbiItem } from 'web3-utils'
import PoolTogetherTicketABI from '@masknet/contracts/abis/PoolTogetherTicket.json'
import type { PoolTogetherTicket } from '@masknet/contracts/types/PoolTogetherTicket'
import { useContracts } from '@masknet/web3-shared'

export function usePoolTogetherTicketContracts(addresses: string[]) {
    return useContracts<PoolTogetherTicket>(addresses, PoolTogetherTicketABI as AbiItem[])
}
