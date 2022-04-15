import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import TranquilProtocol from './TranquilProtocol'
import type { RewardToken, PairConfig } from '../common/protocol/BenQiRewardProtocol'

// https://github.com/vfat-tools/vfat-tools/blob/6329bce901461f1320afa06d5daf95fc4bcd1cec/src/static/js/harmony_tranquil.js#L135
export const TRANQUIL_COMPTROLLER = '0x6a82A17B48EF6be278BBC56138F35d04594587E3'
export const TRANQUIL_Oracle = '0x0C99E05CD2dCb52A583a3694F4d91813eFb5B071'
export const TRANQ_ADDRESS = '0xcf1709ad76a79d5a60210f23e81ce2460542a836'
export const rewardTokens: Array<RewardToken> = [
    {
        symbol: 'TRANQ',
        rewardType: 0,
    },
    {
        symbol: 'tqONE',
        rewardType: 1,
    },
]

const pairConfig = <PairConfig>{
    comptroller: TRANQUIL_COMPTROLLER,
    oracle: TRANQUIL_Oracle,
}

const defaultChain = ChainId.Harmony

// https://openapi.debank.com/v1/token/list_by_ids?is_all=true&has_balance=true&ids=0x3095c7557bCb296ccc6e363DE01b760bA031F2d9,0x6983D1E6DEf3690C4d616b13597A09e6193EA013,0x985458E523dB3d53125813eD68c274899e9DfAb4,0x3C2B8Be99c50593081EAA2A724F0B8285F5aba8f,0x22D62b19b7039333ad773b7185BB61294F3AdC19,0xEf977d2f931C1978Db5F6747666fa1eACB0d0339,0xdc54046c0451f9269FEe1840aeC808D36015697d
// // temp1.filter(c => c.chain == 'ftm').reduce((all, item) => { all[item.symbol] = item.logo_url;  return all; }, {})
const TokenLogos: { [key: string]: string } = {
    ONE: 'https://static.debank.com/image/hmy_token/logo_url/0x22d62b19b7039333ad773b7185bb61294f3adc19/2f50553aafc56d830f636a2d67487786.png',
    stONE: 'https://static.debank.com/image/hmy_token/logo_url/0x22d62b19b7039333ad773b7185bb61294f3adc19/2f50553aafc56d830f636a2d67487786.png',
    '1WBTC':
        'https://static.debank.com/image/hmy_token/logo_url/0x3095c7557bcb296ccc6e363de01b760ba031f2d9/4b8dce79188a892a6ebf6caeec886bed.png',
    '1USDT':
        'https://static.debank.com/image/hmy_token/logo_url/0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f/3c1a718331e468abe1fc2ebe319f6c77.png',
    '1ETH': 'https://static.debank.com/image/hmy_token/logo_url/0x6983d1e6def3690c4d616b13597a09e6193ea013/56f5de0d16e8848bb9ff27cbd8f73f30.png',
    '1USDC':
        'https://static.debank.com/image/hmy_token/logo_url/0x985458e523db3d53125813ed68c274899e9dfab4/43cebbf7a996ebbb31c6b1513e282f0b.png',
    '1BTC': 'https://static.debank.com/image/hmy_token/logo_url/0xdc54046c0451f9269fee1840aec808d36015697d/ed6d39af4cdeca39b6d19dab162b5c02.png',
    '1DAI': 'https://static.debank.com/image/hmy_token/logo_url/0xef977d2f931c1978db5f6747666fa1eacb0d0339/61b18dee6896c6dab0684a78d0eee10a.png',
}

export class TranquilPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [defaultChain]
    public rewardTokens: Array<RewardToken> = rewardTokens

    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(defaultChain)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(TRANQUIL_COMPTROLLER, chainId, web3)
        return (
            allPairs
                // .filter(
                //     (pair: [FungibleTokenDetailed, FungibleTokenDetailed]) =>
                //         pair[0]?.symbol && !excludePairs.includes(pair[0].symbol),
                // )
                .map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
                    const [bareToken, stakeToken] = pair
                    if (stakeToken.symbol === TranquilProtocol.nativeToken) {
                        pair[0] = createNativeToken(defaultChain)
                    }
                    const baseToken = pair[0]
                    if (baseToken.symbol) baseToken.logoURI = TokenLogos[baseToken.symbol]
                    return new TranquilProtocol(pair, allPairs, this.rewardTokens, pairConfig)
                })
        )
    }
}

export const tranquilLazyResolver = new TranquilPairResolver()
