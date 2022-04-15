import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { FungibleTokenDetailed, createContract } from '@masknet/web3-shared-evm'
import { ProtocolType } from '../../types'
import { default as BenQiRewardProtocol, RewardToken, PairConfig } from '../common/protocol/BenQiRewardProtocol'

import type { AuriLens } from '@masknet/web3-contracts/types/AuriLens'
import AuriLensABI from '@masknet/web3-contracts/abis/AuriLens.json'

export function getLensContract(address: string, web3: Web3) {
    return createContract<AuriLens>(web3, address, AuriLensABI as AbiItem[])
}

const rewardTokens: RewardToken[] = [
    // {
    //     symbol: 'PLY',
    //     rewardType: -1,
    // },
    // {
    //     symbol: 'auWNEAR',
    //     rewardType: -1,
    // },
]

export default class AurigamiProtocol extends BenQiRewardProtocol {
    static nativeToken = 'auETH'

    constructor(
        pair: [FungibleTokenDetailed, FungibleTokenDetailed],
        allPairs: [[FungibleTokenDetailed, FungibleTokenDetailed]],
        config: PairConfig,
    ) {
        super(pair, AurigamiProtocol.nativeToken, allPairs, rewardTokens, config)
    }
    override get type() {
        return ProtocolType.Aurigami
    }

    // public override async fetchPrices(
    //     matchPairs: Array<{
    //         underlying: FungibleTokenDetailed
    //         market: FungibleTokenDetailed
    //     }>,
    //     notInPairTokens: Array<RewardToken>,
    //     web3: Web3,
    // ) {
    //     const oracle = getBenQiOracleComptrollerContract(this.config.oracle, web3)
    //     if (oracle === null) return []
    //     const allResults = await Promise.all(
    //         matchPairs
    //             .filter((_) => _.market.symbol !== undefined)
    //             .map(async (item) => {
    //                 const { underlying, market } = item
    //                 const price = await oracle.methods.getUnderlyingPrice(market.address).call()
    //                 // https://github.com/tranquil-finance/core-contracts/blob/master/contracts/Chainlink/TranquilChainlinkOracle.sol#L53
    //                 const defaultDecimals = 18
    //                 const decimalDelta = defaultDecimals - underlying.decimals
    //                 const divideDecimals = decimalDelta > 0 ? defaultDecimals + decimalDelta : defaultDecimals
    //                 return {
    //                     symbol: market.symbol,
    //                     price: new BigNumber(price).shiftedBy(-divideDecimals),
    //                 } as MarketStatus
    //             }),
    //     )

    //     // TRANQ not in tranquil pair list
    //     const price = await oracle.methods.getPrice(TRANQ_ADDRESS).call()
    //     allResults.push({
    //         symbol: 'TRANQ',
    //         price: new BigNumber(price).shiftedBy(-18),
    //     })

    //     return allResults
    // }

    // public override async fetchSpeeds(web3: Web3) {
    //     if (!this.config.lens) return []
    //     const lens = getLensContract(this.config.lens, web3)
    //     if (lens === null) return []
    //     const [plyRewardSupplySpeed, plyRewardBorrowSpeed, auroraRewardSupplySpeed, auroraRewardBorrowSpeed] =
    //         await lens.methods.getRewardSpeeds(this.config.comptroller, this.stakeToken.address).call()

    //     console.log(this.stakeToken.symbol, this.config.comptroller, {
    //         stakeToken: this.stakeToken,
    //         plyRewardSupplySpeed,
    //         plyRewardBorrowSpeed,
    //         auroraRewardSupplySpeed,
    //         auroraRewardBorrowSpeed,
    //     })
    //     return [
    //         {
    //             symbol: 'auWNEAR',
    //             speed: new BigNumber(auroraRewardSupplySpeed),
    //         },
    //         {
    //             symbol: 'PLY',
    //             speed: new BigNumber(plyRewardSupplySpeed),
    //         },
    //     ]
    // }
}
