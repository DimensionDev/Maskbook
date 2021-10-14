import { useContract, useFoundationConstants } from '@masknet/web3-shared'
import FoundationAbi from '@masknet/web3-contracts/abis/Foundation.json'
import type { Foundation } from '@masknet/web3-contracts/types/Foundation'
import type { AbiItem } from 'web3-utils'

export function useFoundationContract() {
    const { MARKET_ADDRESS } = useFoundationConstants()
    return useContract<Foundation>(MARKET_ADDRESS, FoundationAbi as AbiItem[])
}
