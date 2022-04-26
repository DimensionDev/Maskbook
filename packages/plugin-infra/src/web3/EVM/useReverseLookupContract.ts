import type { AbiItem } from 'web3-utils'
import ReverseRecordsABI from '@masknet/web3-contracts/abis/ReverseRecords.json'
import type { ReverseRecords } from '@masknet/web3-contracts/types/ReverseRecords'
import { ChainId, useEthereumConstants } from '@masknet/web3-shared-evm'
import { useContract } from './useContract'

export function useReverseRecordsContract(chainId?: ChainId) {
    const { ENS_REVERSE_RECORDS_ADDRESS } = useEthereumConstants(ChainId.Mainnet)
    return useContract<ReverseRecords>(chainId, ENS_REVERSE_RECORDS_ADDRESS, ReverseRecordsABI as AbiItem[])
}
