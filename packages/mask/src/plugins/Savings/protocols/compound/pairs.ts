import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import { COMPOUND_COMPTROLLER } from '../../constants'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import { CompoundProtocol } from './CompoundProtocol'

export class CompoundPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Mainnet]
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(ChainId.Mainnet)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(COMPOUND_COMPTROLLER, chainId, web3)
        return allPairs.map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
            const [bareToken, stakeToken] = pair
            if (stakeToken.symbol === CompoundProtocol.nativeToken) {
                pair[0] = createNativeToken(ChainId.Mainnet)
            }
            return new CompoundProtocol(pair)
        })
    }
}

export const compoundLazyResolver = new CompoundPairResolver()

// import { ChainId, createERC20Token, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
// import { CompoundProtocol } from './CompoundProtocol'

// export const COMPOUND_PAIRS_LIST: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
//     [
//         createNativeToken(ChainId.Mainnet),
//         createERC20Token(ChainId.Mainnet, '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5', 8, 'Compound Ether', 'cETH'),
//     ],
//     [
//         createERC20Token(ChainId.Mainnet, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'Tether USD', 'USDT'),
//         createERC20Token(ChainId.Mainnet, '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9', 8, 'Compound USDT', 'cUSDT'),
//     ],
//     [
//         createERC20Token(ChainId.Mainnet, '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', 18, 'Aave Token', 'AAVE'),
//         createERC20Token(
//             ChainId.Mainnet,
//             '0xe65cdb6479bac1e22340e4e755fae7e509ecd06c',
//             8,
//             'Compound Aave Token',
//             'cAAVE',
//         ),
//     ],
//     [
//         createERC20Token(ChainId.Mainnet, '0x6b175474e89094c44da98b954eedeac495271d0f', 18, 'Dai Stablecoin', 'DAI'),
//         createERC20Token(ChainId.Mainnet, '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', 8, 'Compound Dai', 'cDAI'),
//     ],
//     [
//         createERC20Token(ChainId.Mainnet, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', 8, 'Wrapped BTC', 'WBTC'),
//         createERC20Token(
//             ChainId.Mainnet,
//             '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4',
//             8,
//             'Compound Wrapped BTC',
//             'cWBTC',
//         ),
//     ],
//     [
//         createERC20Token(ChainId.Mainnet, '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', 18, 'yearn.finance', 'YFI'),
//         createERC20Token(
//             ChainId.Mainnet,
//             '0x80a2ae356fc9ef4305676f7a3e2ed04e12c33946',
//             8,
//             'Compound yearn.finance',
//             'cYFI',
//         ),
//     ],
//     [
//         createERC20Token(ChainId.Mainnet, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USD Coin', 'USDC'),
//         createERC20Token(
//             ChainId.Mainnet,
//             '0x39aa39c021dfbae8fac545936693ac917d5e7563',
//             8,
//             'Compound USD Coin',
//             'cUSDC',
//         ),
//     ],
//     [
//         createERC20Token(ChainId.Mainnet, '0x514910771af9ca656af840dff83e8264ecf986ca', 18, 'ChainLink Token', 'LINK'),
//         createERC20Token(
//             ChainId.Mainnet,
//             '0xface851a4921ce59e912d19329929ce6da6eb0c7',
//             8,
//             'Compound ChainLink Token',
//             'cLINK',
//         ),
//     ],
// ]

// export const COMPOUND_PAIRS = COMPOUND_PAIRS_LIST.map((pair) => new CompoundProtocol(pair))
