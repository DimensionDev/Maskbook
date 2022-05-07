import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, getGiestConstants, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { GiestProtocol } from './GiestProtocol'

// Metadata
// addresses:
// https://docs.geist.finance/useful-info/deployments-addresses
//
// token icon from:
// form https://openapi.debank.com/v1/token/list_by_ids?is_all=true&has_balance=true&ids=0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E,0x74b23882a30290451A17c44f4F05243b6b58C76d,0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83,0x321162Cd933E2Be498Cd2267a90534A804051b11,0x049d68029688eAbF473097a2fC38ef61633A3C7A,0x04068DA6C83AFCFA0e13ba15A6696662335D5B75,0x1E4F97b9f9F913c46F1632781732927B9019C68b,0x82f0B8B456c1A451378467398982d4834b6829c1,0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8
// temp1.filter(c => c.chain == 'ftm').reduce((all, item) => { all[item.symbol] = item.logo_url;  return all; }, {})

export const AaveProtocolDataProvider = getGiestConstants(ChainId.Fantom).PROTOCOL_DATA_PROVIDER || ZERO_ADDRESS
export const LendingPoolAddressProvider =
    getGiestConstants(ChainId.Fantom).LENDING_POOL_ADDRESSES_PROVIDER || ZERO_ADDRESS

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
        return allPairsWithArgs.map((args: [[FungibleTokenDetailed, FungibleTokenDetailed], string, string]) => {
            const [pair, pool, dataProvider] = args
            return new GiestProtocol(pair, pool, dataProvider)
        })
    }
}

export const giestLazyResolver = new GiestPairResolver()
