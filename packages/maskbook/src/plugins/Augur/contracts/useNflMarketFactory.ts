import type { AbiItem } from 'web3-utils'
import NflMarketFactoryABI from '@masknet/web3-contracts/abis/AugurMmaLinkMarketFactory.json'
import type { AugurNflMarketFactory } from '@masknet/web3-contracts/types/AugurNflMarketFactory'
import { useContract } from '@masknet/web3-shared-evm'

export function useNflkMarketFactory(address: string) {
    return useContract<AugurNflMarketFactory>(address, NflMarketFactoryABI as AbiItem[])
}
