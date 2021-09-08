import QuoterABI from '@masknet/web3-contracts/abis/Quoter.json'
import type { Quoter } from '@masknet/web3-contracts/types/Quoter'
import { useContract, useTraderConstants } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useQuoterContract() {
    const { UNISWAP_V3_QUOTER_ADDRESS } = useTraderConstants()
    return useContract<Quoter>(UNISWAP_V3_QUOTER_ADDRESS, QuoterABI as AbiItem[])
}
