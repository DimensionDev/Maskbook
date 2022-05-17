import QuoterABI from '@masknet/web3-contracts/abis/Quoter.json'
import type { Quoter } from '@masknet/web3-contracts/types/Quoter'
import { ChainId, useChainId, useContract, useTraderConstants } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function useQuoterContract(chainId?: ChainId) {
    const _chainId = useChainId()
    const { UNISWAP_V3_QUOTER_ADDRESS } = useTraderConstants(chainId)
    return useContract<Quoter>(chainId ?? _chainId, UNISWAP_V3_QUOTER_ADDRESS, QuoterABI as AbiItem[])
}
