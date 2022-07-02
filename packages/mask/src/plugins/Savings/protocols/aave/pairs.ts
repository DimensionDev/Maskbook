import type Web3 from 'web3'
import { ChainId, getAaveConstants, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver, PairToken } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { AAVEProtocol } from './AAVEProtocol'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

const AaveProtocolDataProvider =
    getAaveConstants(ChainId.Mainnet).AAVE_PROTOCOL_DATA_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS
const LendingPoolAddressProvider =
    getAaveConstants(ChainId.Mainnet).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS

export class AAVEResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Mainnet]
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
            return new AAVEProtocol(pair as PairToken, pool as string, dataProvider as string)
        })
    }
}

export const aaveLazyResolver = new AAVEResolver()
