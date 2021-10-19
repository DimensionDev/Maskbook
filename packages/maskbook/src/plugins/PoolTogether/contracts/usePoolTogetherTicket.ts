import type { AbiItem } from 'web3-utils'
import PoolTogetherTicketABI from '@masknet/web3-contracts/abis/PoolTogetherTicket.json'
import type { PoolTogetherTicket } from '@masknet/web3-contracts/types/PoolTogetherTicket'
import { useContracts } from '@masknet/web3-shared-evm'

export function usePoolTogetherTicketContracts(addresses: string[]) {
    return useContracts<PoolTogetherTicket>(addresses, PoolTogetherTicketABI as AbiItem[])
}
