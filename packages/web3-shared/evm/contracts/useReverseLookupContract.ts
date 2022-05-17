import ReverseRecordsABI from '@masknet/web3-contracts/abis/ReverseRecords.json'
import type { ReverseRecords } from '@masknet/web3-contracts/types/ReverseRecords'
import type { AbiItem } from 'web3-utils'
import { ChainId } from '../types'
import { useContract } from '../hooks/useContract'
import { useEthereumConstants } from '../constants'
import { useChainId } from '../hooks'

export function useReverseRecordsContract() {
    const chainId = useChainId()
    const { ENS_REVERSE_RECORDS_ADDRESS } = useEthereumConstants(ChainId.Mainnet)
    return useContract<ReverseRecords>(chainId, ENS_REVERSE_RECORDS_ADDRESS, ReverseRecordsABI as AbiItem[])
}
