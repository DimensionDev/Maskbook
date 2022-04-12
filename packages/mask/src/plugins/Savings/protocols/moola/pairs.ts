import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { MoolaProtocol } from './MoolaProtocol'

// https://github.com/moolamarket/moola-v2/blob/main/cli.js#L290
export const AaveProtocolDataProvider = '0x43d067ed784D9DD2ffEda73775e2CC4c560103A1'
export const LendingPoolAddressProvider = '0xD1088091A174d33412a968Fa34Cb67131188B332'

// form https://openapi.debank.com/v1/token/list_by_ids?is_all=true&has_balance=true&ids=0x471EcE3750Da237f93B8E339c536989b8978a438,0x765DE816845861e75A25fCA122bb6898B8B1282a,0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73,0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787,0x17700282592D6917F6A73D0bF8AcCf4D578c131e
// temp1.filter(c => c.chain == 'ftm').reduce((all, item) => { all[item.symbol] = item.logo_url;  return all; }, {})
const tokenLogos: { [key: string]: string } = {
    MOO: 'https://static.debank.com/image/celo_token/logo_url/0x17700282592d6917f6a73d0bf8accf4d578c131e/7ed8826cb36d17b032528714ce908b20.png',
    CELO: 'https://static.debank.com/image/celo_token/logo_url/0x471ece3750da237f93b8e339c536989b8978a438/6f524d91db674876ba0f5767cf0124cc.png',
    cUSD: 'https://static.debank.com/image/celo_token/logo_url/0x765de816845861e75a25fca122bb6898b8b1282a/17f6d58bd2a344a2098ef8123be88693.png',
    cEUR: 'https://static.debank.com/image/celo_token/logo_url/0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73/f00fcdbf2e75d1d5a8dbbe57653ecbb5.png',
    cREAL: 'https://s2.coinmarketcap.com/static/img/coins/128x128/16385.png',
}

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
            const [bareToken, stakeToken] = pair
            if (bareToken.symbol) bareToken.logoURI = tokenLogos[bareToken.symbol]
            return new MoolaProtocol(pair, pool, dataProvider)
        })
    }
}

export const moolaLazyResolver = new MoolaPairResolver()
