import ReverseRecordsABI from '@masknet/web3-contracts/abis/ReverseRecords.json'
import type { ReverseRecords } from '@masknet/web3-contracts/types/ReverseRecords'
import type { AbiItem } from 'web3-utils'
import { ChainId, useContract, useEthereumConstants } from '..'

export function useReverseRecordsContract() {
    const { ENS_REVERSE_RECORDS_ADDRESS } = useEthereumConstants(ChainId.Mainnet)
    return useContract<ReverseRecords>(ENS_REVERSE_RECORDS_ADDRESS, ReverseRecordsABI as AbiItem[])
}
