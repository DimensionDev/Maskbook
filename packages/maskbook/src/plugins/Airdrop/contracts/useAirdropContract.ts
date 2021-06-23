import type { AbiItem } from 'web3-utils'
import type { Airdrop } from '@masknet/contracts/types/Airdrop'
import { AIRDROP_CONSTANTS } from '../constants'
import AirdropABI from '@masknet/contracts/abis/Airdrop.json'
import { useConstant, useContract } from '@masknet/web3-shared'

export function useAirdropContract() {
    const { AIRDROP_CONTRACT_ADDRESS } = useConstant(AIRDROP_CONSTANTS)
    return useContract<Airdrop>(AIRDROP_CONTRACT_ADDRESS, AirdropABI as AbiItem[])
}
