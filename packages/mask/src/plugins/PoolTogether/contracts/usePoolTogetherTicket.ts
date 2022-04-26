import type { AbiItem } from 'web3-utils'
import PoolTogetherTicketABI from '@masknet/web3-contracts/abis/PoolTogetherTicket.json'
import type { PoolTogetherTicket } from '@masknet/web3-contracts/types/PoolTogetherTicket'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContracts } from '@masknet/plugin-infra/web3-evm'

export function usePoolTogetherTicketContracts(chainId: ChainId, addresses: string[]) {
    return useContracts<PoolTogetherTicket>(chainId, addresses, PoolTogetherTicketABI as AbiItem[])
}
