import type { AbiItem } from 'web3-utils'
import SportsLinkMarketFactoryABI from '@masknet/contracts/abis/AugurSportsLinkMarketFactory.json'
import type { AugurSportsLinkMarketFactory } from '@masknet/contracts/types/AugurSportsLinkMarketFactory'
import { useContract } from '@masknet/web3-shared'

export function useSportsLinkMarketFactory(address: string) {
    return useContract<AugurSportsLinkMarketFactory>(address, SportsLinkMarketFactoryABI as AbiItem[])
}
