import { getAlpacaConstants, createNativeToken, ChainId } from '@masknet/web3-shared-evm'
import { AlpacaProtocol } from './AlpacaProtocol'
import type Web3 from 'web3'
import type { SavingsProtocol, PairToken, ProtocolPairsResolver } from '../../types'
import { flatten, chunk } from 'lodash-unified'
import { getFungibleTokensDetailed } from '../common/tokens'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

export const SUMMARY_API = getAlpacaConstants(ChainId.BSC).SUMMARY_API

export class PairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.BSC]
    public async resolve(
        chainId: ChainId,
        web3: Web3,
        connection: Web3Helper.Web3ConnectionScope,
    ): Promise<SavingsProtocol[]> {
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
            return m
        })

        const detailedTokens = await getFungibleTokensDetailed(allTokens, connection, chainId)
        return chunk(detailedTokens, 2).map((pair) => {
            const [bareToken, stakeToken] = pair
            if (stakeToken.symbol === AlpacaProtocol.nativeToken) {
                pair[0] = createNativeToken(ChainId.BSC)
            }
            return new AlpacaProtocol(pair as PairToken)
        })
    }
}

export const alpacaLazyResolver = new PairResolver()
