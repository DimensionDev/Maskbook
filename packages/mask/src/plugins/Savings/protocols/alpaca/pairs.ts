import {
    FungibleTokenDetailed,
    getAlpacaConstants,
    createNativeToken,
    ChainId,
    EthereumTokenType,
} from '@masknet/web3-shared-evm'
import { AlpacaProtocol } from './AlpacaProtocol'
import type Web3 from 'web3'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import { flatten } from 'lodash-unified'
import { getFungibleTokensDetailed, splitToPair } from '../common/tokens'

export const SUMMARY_API = getAlpacaConstants(ChainId.BSC).SUMMARY_API

export class PairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.BSC]
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(chainId)) {
            return []
        }
        if (!SUMMARY_API) return []
        const response = await fetch(SUMMARY_API)
        const fullResponse: {
            data: {
                lendingPools: Array<{
                    baseToken: {
                        address: string
                        symbol: string
                    }
                    ibToken: {
                        address: string
                        symbol: string
                    }
                }>
            }
        } = await response.json()
        const allTokens = flatten(
            fullResponse.data.lendingPools.map((_) => {
                return [_.baseToken.address, _.ibToken.address]
            }),
        ).map((m) => {
            return { address: m, type: EthereumTokenType.ERC20 }
        })

        const detailedTokens = await getFungibleTokensDetailed(allTokens, web3, chainId)
        return splitToPair(detailedTokens).map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
            const [bareToken, stakeToken] = pair
            if (stakeToken.symbol === AlpacaProtocol.nativeToken) {
                pair[0] = createNativeToken(ChainId.BSC)
            }
            return new AlpacaProtocol(pair)
        })
    }
}

export const alpacaLazyResolver = new PairResolver()
