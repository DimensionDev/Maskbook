import type { AbiItem } from 'web3-utils'
import AugurAmmFactoryABI from '@masknet/web3-contracts/abis/AugurAmmFactory.json'
import type { AugurAmmFactory } from '@masknet/web3-contracts/types/AugurAmmFactory'
import { useContract } from '@masknet/web3-shared'

export function useAmmFactory(address: string) {
    return useContract<AugurAmmFactory>(address, AugurAmmFactoryABI as AbiItem[])
}
