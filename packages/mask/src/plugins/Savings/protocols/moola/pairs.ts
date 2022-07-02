import type Web3 from 'web3'
import { ChainId, getMoolaConstants, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, PairToken, ProtocolPairsResolver } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { MoolaProtocol } from './MoolaProtocol'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

// Metadata
// address from:
// https://github.com/moolamarket/moola-v2/blob/main/cli.js#L290
//
const AaveProtocolDataProvider = getMoolaConstants(ChainId.Celo).PROTOCOL_DATA_PROVIDER || ZERO_ADDRESS
const LendingPoolAddressProvider = getMoolaConstants(ChainId.Celo)?.LENDING_POOL_ADDRESSES_PROVIDER || ZERO_ADDRESS

export class MoolaPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Celo]
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
            return new MoolaProtocol(pair as PairToken, pool as string, dataProvider as string)
        })
    }
}

export const moolaLazyResolver = new MoolaPairResolver()
