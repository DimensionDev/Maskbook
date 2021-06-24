import { useAirdropConstants } from '@masknet/constants'
import AirdropABI from '@masknet/contracts/abis/Airdrop.json'
import type { Airdrop } from '@masknet/contracts/types/Airdrop'
import { useContract } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useAirdropContract() {
    const { AIRDROP_CONTRACT_ADDRESS } = useAirdropConstants()
    return useContract<Airdrop>(AIRDROP_CONTRACT_ADDRESS, AirdropABI as AbiItem[])
}
