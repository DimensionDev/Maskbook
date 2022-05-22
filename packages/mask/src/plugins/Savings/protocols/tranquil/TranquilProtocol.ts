import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { FungibleTokenDetailed, getTranquilConstants, ZERO_ADDRESS, createContract } from '@masknet/web3-shared-evm'
import { ProtocolType } from '../../types'
import BigNumber from 'bignumber.js'
import {
    default as BenQiRewardProtocol,
    MarketStatus,
    RewardToken,
    PairConfig,
} from '../common/protocol/BenQiRewardProtocol'
import type { TranquilPriceOracleV2 } from '@masknet/web3-contracts/types/TranquilPriceOracleV2'
import TranquilPriceOracleV2ABI from '@masknet/web3-contracts/abis/TranquilPriceOracleV2.json'

export const TRANQ_ADDRESS = getTranquilConstants(ChainId.Harmony).TRANQ || ZERO_ADDRESS

export function getComptrollerContract(address: string, web3: Web3) {
    return createContract<TranquilPriceOracleV2>(web3, address, TranquilPriceOracleV2ABI as AbiItem[])
}

export default class TranquilProtocol extends BenQiRewardProtocol {
    static nativeToken = 'tqONE'

    constructor(
        pair: [FungibleTokenDetailed, FungibleTokenDetailed],
        allPairs: [[FungibleTokenDetailed, FungibleTokenDetailed]],
        rewardTokens: RewardToken[],
        config: PairConfig,
    ) {
        super(pair, TranquilProtocol.nativeToken, allPairs, rewardTokens, config)
    }

    override get type() {
        return ProtocolType.Tranquil
    }

    public override async fetchPrices(
        matchPairs: Array<{
            underlying: FungibleTokenDetailed
            market: FungibleTokenDetailed
        }>,
        notInPairTokens: RewardToken[],
        web3: Web3,
    ) {
        const oracle = getComptrollerContract(this.config.oracle, web3)
        if (oracle === null) return []
        const allResults = await Promise.all(
            matchPairs
                .filter((_) => _.market.symbol !== undefined)
                .map(async (item) => {
                    const { underlying, market } = item
                    const price = await oracle.methods.getUnderlyingPrice(market.address).call()
                    // https://github.com/tranquil-finance/core-contracts/blob/master/contracts/Chainlink/TranquilChainlinkOracle.sol#L53
                    const defaultDecimals = 18
                    const decimalDelta = defaultDecimals - underlying.decimals
                    const divideDecimals = decimalDelta > 0 ? defaultDecimals + decimalDelta : defaultDecimals
                    return {
                        symbol: market.symbol,
                        price: new BigNumber(price).shiftedBy(-divideDecimals),
                    } as MarketStatus
                }),
        )

        // TRANQ not in tranquil pair list
        const price = await oracle.methods.getPrice(TRANQ_ADDRESS).call()
        allResults.push({
            symbol: 'TRANQ',
            price: new BigNumber(price).shiftedBy(-18),
        })

        return allResults
    }
}
