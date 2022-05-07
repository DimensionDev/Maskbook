import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, getMoolaConstants, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { MoolaProtocol } from './MoolaProtocol'

// Metadata
// address from:
// https://github.com/moolamarket/moola-v2/blob/main/cli.js#L290
//
// custom logos from:
// https://openapi.debank.com/v1/token/list_by_ids?is_all=true&has_balance=true&ids=0x471EcE3750Da237f93B8E339c536989b8978a438,0x765DE816845861e75A25fCA122bb6898B8B1282a,0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73,0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787,0x17700282592D6917F6A73D0bF8AcCf4D578c131e
// temp1.filter(_ => _.chain == 'celo').map(_ => ({address: _.id, name: _.symbol, logo_url: _.logo_url }))

const AaveProtocolDataProvider = getMoolaConstants(ChainId.Celo).PROTOCOL_DATA_PROVIDER || ZERO_ADDRESS
const LendingPoolAddressProvider = getMoolaConstants(ChainId.Celo)?.LENDING_POOL_ADDRESSES_PROVIDER || ZERO_ADDRESS

export class MoolaPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Celo]
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(chainId)) {
            return []
        }

        const allPairsWithArgs = await AAVELikeFetcher.fetch(
            AaveProtocolDataProvider,
            LendingPoolAddressProvider,
            chainId,
            web3,
        )
        return allPairsWithArgs.map((args: [[FungibleTokenDetailed, FungibleTokenDetailed], string, string]) => {
            const [pair, pool, dataProvider] = args
            return new MoolaProtocol(pair, pool, dataProvider)
        })
    }
}

export const moolaLazyResolver = new MoolaPairResolver()
