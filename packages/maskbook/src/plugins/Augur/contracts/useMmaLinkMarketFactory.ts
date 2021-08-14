import type { AbiItem } from 'web3-utils'
import MmaLinkMarketFactoryABI from '@masknet/web3-contracts/abis/AugurMmaLinkMarketFactory.json'
import type { AugurMmaLinkMarketFactoryV2 } from '@masknet/web3-contracts/types/AugurMmaLinkMarketFactoryV2'
import { useContract } from '@masknet/web3-shared'

export function useMmaLinkMarketFactory(address: string) {
    return useContract<AugurMmaLinkMarketFactoryV2>(address, MmaLinkMarketFactoryABI as AbiItem[])
}
