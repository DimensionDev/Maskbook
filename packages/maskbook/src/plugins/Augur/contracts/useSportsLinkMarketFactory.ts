import type { AbiItem } from 'web3-utils'
import SportsLinkMarketFactoryABI from '@masknet/web3-contracts/abis/AugurSportsLinkMarketFactoryV2.json'
import type { AugurSportsLinkMarketFactoryV2 } from '@masknet/web3-contracts/types/AugurSportsLinkMarketFactoryV2'
import { useContract } from '@masknet/web3-shared-evm'

export function useSportsLinkMarketFactory(address: string) {
    return useContract<AugurSportsLinkMarketFactoryV2>(address, SportsLinkMarketFactoryABI as AbiItem[])
}
