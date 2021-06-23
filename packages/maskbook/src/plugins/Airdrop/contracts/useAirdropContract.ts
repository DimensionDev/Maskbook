import type { AbiItem } from 'web3-utils'
import type { Airdrop } from '@masknet/contracts/types/Airdrop'
import { AIRDROP_CONSTANTS } from '../constants'
import AirdropABI from '@masknet/contracts/abis/Airdrop.json'
import { useConstant, useContract } from '@masknet/web3-shared'

export function useAirdropContract() {
    const address = useConstant(AIRDROP_CONSTANTS).AIRDROP_CONTRACT_ADDRESS
    return useContract<Airdrop>(address, AirdropABI as AbiItem[])
}
