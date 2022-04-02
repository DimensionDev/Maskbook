import type Web3 from 'web3'
import { ChainId } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import { BENQI_COMPTROLLER } from '../../constants'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import { BenQiProtocol } from './BenQiProtocol'

export class BenQiResolver implements ProtocolPairsResolver {
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (chainId !== ChainId.Avalanche) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(BENQI_COMPTROLLER, chainId, web3)
        return allPairs.map((pair: any) => new BenQiProtocol(pair))
    }
}

export const benqiLazyResolver = new BenQiResolver()
