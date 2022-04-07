import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
// import { AURIGAMI_COMPTROLLER } from '../../constants'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import { AurigamiProtocol } from './AurigamiProtocol'

export const AURIGAMI_COMPTROLLER = '0x817af6cfAF35BdC1A634d6cC94eE9e4c68369Aeb'
const excludePairs = ['DAI']
const TokenLogos: { [key: string]: string } = {
    STNEAR: 'https://static.debank.com/image/aurora_token/logo_url/0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d/af4e945c578e905bd2e9dd50deb46972.png',
    USDT: 'https://static.debank.com/image/aurora_token/logo_url/0x4988a896b1227218e4a686fde5eabdcabd91571f/3c1a718331e468abe1fc2ebe319f6c77.png',
    AURORA: 'https://static.debank.com/image/aurora_token/logo_url/0x8bec47865ade3b172a928df8f990bc7f2a3b9f79/ec63b91b7247ce338caa842eb6439530.png',
    USDC: 'https://static.debank.com/image/aurora_token/logo_url/0xb12bfca5a55806aaf64e99521918a4bf0fc40802/43cebbf7a996ebbb31c6b1513e282f0b.png',
    NEAR: 'https://static.debank.com/image/aurora_token/logo_url/0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d/af4e945c578e905bd2e9dd50deb46972.png',
    WBTC: 'https://static.debank.com/image/aurora_token/logo_url/0xf4eb217ba2454613b15dbdea6e5f22276410e89e/4b8dce79188a892a6ebf6caeec886bed.png',
    TRI: 'https://static.debank.com/image/aurora_token/logo_url/0xfa94348467f64d5a457f75f8bc40495d33c65abb/f529cbfca541546078d1aa49ecf81056.png',
}

export class AurigamiPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Aurora]
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(ChainId.Aurora)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(AURIGAMI_COMPTROLLER, chainId, web3)
        return allPairs
            .filter(
                (pair: [FungibleTokenDetailed, FungibleTokenDetailed]) =>
                    pair[0]?.symbol && !excludePairs.includes(pair[0].symbol),
            )
            .map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
                const [bareToken, stakeToken] = pair
                if (stakeToken.symbol === AurigamiProtocol.nativeToken) {
                    pair[0] = createNativeToken(ChainId.Aurora)
                }

                if (bareToken.symbol) bareToken.logoURI = TokenLogos[bareToken.symbol]
                return new AurigamiProtocol(pair)
            })
    }
}

export const aurigamiLazyResolver = new AurigamiPairResolver()
