import type Web3 from 'web3'
import { ChainId, getGiestConstants, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, PairToken, ProtocolPairsResolver } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { GiestProtocol } from './GiestProtocol'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

// Metadata
// addresses:
// https://docs.geist.finance/useful-info/deployments-addresses
//

export const AaveProtocolDataProvider = getGiestConstants(ChainId.Fantom).PROTOCOL_DATA_PROVIDER || ZERO_ADDRESS
export const LendingPoolAddressProvider =
    getGiestConstants(ChainId.Fantom).LENDING_POOL_ADDRESSES_PROVIDER || ZERO_ADDRESS

export class GiestPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Fantom]

    public async resolve(
        chainId: ChainId,
        web3: Web3,
        connection: Web3Helper.Web3ConnectionScope,
    ): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(chainId)) {
            return []
        }

        const allPairsWithArgs = await AAVELikeFetcher.fetch(
            AaveProtocolDataProvider,
            LendingPoolAddressProvider,
            chainId,
            web3,
            connection,
        )
        return allPairsWithArgs.map((args) => {
            const [pair, pool, dataProvider] = args
            return new GiestProtocol(pair as PairToken, pool as string, dataProvider as string)
        })
    }
}

export const giestLazyResolver = new GiestPairResolver()
