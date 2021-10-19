import type { AbiItem } from 'web3-utils'
import AugurAMMFactoryABI from '@masknet/web3-contracts/abis/AugurAMMFactory.json'
import type { AugurAMMFactory } from '@masknet/web3-contracts/types/AugurAMMFactory'
import { useContract } from '@masknet/web3-shared'

export function useAMMFactory(address: string) {
    return useContract<AugurAMMFactory>(address, AugurAMMFactoryABI as AbiItem[])
}
