import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { GiestProtocol } from './GiestProtocol'

// https://docs.geist.finance/useful-info/deployments-addresses
export const AaveProtocolDataProvider = '0xf3B0611e2E4D2cd6aB4bb3e01aDe211c3f42A8C3'
export const LendingPoolAddressProvider = '0x6c793c628Fe2b480c5e6FB7957dDa4b9291F9c9b'

// form https://openapi.debank.com/v1/token/list_by_ids?is_all=true&has_balance=true&ids=0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E,0x74b23882a30290451A17c44f4F05243b6b58C76d,0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83,0x321162Cd933E2Be498Cd2267a90534A804051b11,0x049d68029688eAbF473097a2fC38ef61633A3C7A,0x04068DA6C83AFCFA0e13ba15A6696662335D5B75,0x1E4F97b9f9F913c46F1632781732927B9019C68b,0x82f0B8B456c1A451378467398982d4834b6829c1,0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8
// temp1.filter(c => c.chain == 'ftm').reduce((all, item) => { all[item.symbol] = item.logo_url;  return all; }, {})
const tokenLogos: { [key: string]: string } = {
    USDC: 'https://static.debank.com/image/ftm_token/logo_url/0x04068da6c83afcfa0e13ba15a6696662335d5b75/fffcd27b9efff5a86ab942084c05924d.png',
    fUSDT: 'https://static.debank.com/image/ftm_token/logo_url/0x049d68029688eabf473097a2fc38ef61633a3c7a/66eadee7b7bb16b75e02b570ab8d5c01.png',
    CRV: 'https://static.debank.com/image/ftm_token/logo_url/0x1e4f97b9f9f913c46f1632781732927b9019c68b/38f4cbac8fb4ac70c384a65ae0cca337.png',
    WFTM: 'https://static.debank.com/image/ftm_token/logo_url/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83/2b7d91858f9c62aafc8d7778b9c22f57.png',
    BTC: 'https://static.debank.com/image/ftm_token/logo_url/0x321162cd933e2be498cd2267a90534a804051b11/d3c52e7c7449afa8bd4fad1c93f50d93.png',
    ETH: 'https://static.debank.com/image/ftm_token/logo_url/0x74b23882a30290451a17c44f4f05243b6b58c76d/61844453e63cf81301f845d7864236f6.png',
    MIM: 'https://static.debank.com/image/ftm_token/logo_url/0x82f0b8b456c1a451378467398982d4834b6829c1/7d0c0fb6eab1b7a8a9bfb7dcc04cb11e.png',
    DAI: 'https://static.debank.com/image/ftm_token/logo_url/0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e/549c4205dbb199f1b8b03af783f35e71.png',
    LINK: 'https://static.debank.com/image/ftm_token/logo_url/0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8/69425617db0ef93a7c21c4f9b81c7ca5.png',
}

export class GiestPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Fantom]
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
        console.log('allPairsWithArgs', allPairsWithArgs)
        return allPairsWithArgs.map((args: [[FungibleTokenDetailed, FungibleTokenDetailed], string, string]) => {
            const [pair, pool, dataProvider] = args
            const [bareToken, stakeToken] = pair
            if (bareToken.symbol) bareToken.logoURI = tokenLogos[bareToken.symbol]
            return new GiestProtocol(pair, pool, dataProvider)
        })
    }
}

export const giestLazyResolver = new GiestPairResolver()
