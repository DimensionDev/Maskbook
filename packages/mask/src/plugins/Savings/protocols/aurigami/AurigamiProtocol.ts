import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { FungibleTokenDetailed, createContract } from '@masknet/web3-shared-evm'
import { ProtocolType } from '../../types'
import {
    default as BenQiRewardProtocol,
    RewardToken,
    MarketStatus,
    emptyRewardType,
    PairConfig,
} from '../common/protocol/BenQiRewardProtocol'
import BigNumber from 'bignumber.js'

import type { AuriLens } from '@masknet/web3-contracts/types/AuriLens'
import AuriLensABI from '@masknet/web3-contracts/abis/AuriLens.json'
import { MARKETS_NOT_IN_PRICE_ORACLE, getNoneInPriceOraclePrices } from './price'

export function getLensContract(address: string, web3: Web3) {
    return createContract<AuriLens>(web3, address, AuriLensABI as AbiItem[])
}

const auRewardTokenSymbol = 'auPLY'
const rewardTokens: RewardToken[] = [
    {
        symbol: auRewardTokenSymbol,
        rewardType: emptyRewardType,
    },
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

    // load price
    public override async fetchPrices(
        matchPairs: Array<{
            underlying: FungibleTokenDetailed
            market: FungibleTokenDetailed
        }>,
        notInPairTokens: RewardToken[],
        web3: Web3,
    ) {
        if (!this.config.lens) return []
        const lens = getLensContract(this.config.lens, web3)
        if (lens === null) return []
        return Promise.all(
            matchPairs
                .filter((_) => _.market.symbol !== undefined)
                .map(async (item) => {
                    const { underlying, market } = item
                    const notInOracle = market.symbol ? MARKETS_NOT_IN_PRICE_ORACLE.includes(market.symbol) : false
                    const price = notInOracle
                        ? await getNoneInPriceOraclePrices(web3, market.symbol)
                        : (await lens.methods.auTokenUnderlyingPrice(market.address).call())[1]
                    // https://github.com/Aurigami-Finance/aurigami-smart-contracts/blob/main/contracts/AuriOracle.sol#L124
                    const defaultDecimals = 18
                    const decimalDefault = 8
                    const paddingDecimals = 10
                    const decimalDelta = underlying.decimals - defaultDecimals
                    const divideDecimals =
                        underlying.decimals <= defaultDecimals
                            ? decimalDefault + paddingDecimals + defaultDecimals - underlying.decimals
                            : decimalDefault + paddingDecimals - decimalDelta
                    return {
                        symbol: market.symbol,
                        price: notInOracle ? price : new BigNumber(price).shiftedBy(-divideDecimals),
                    } as MarketStatus
                }),
        )
    }

    public override async fetchSpeeds(web3: Web3) {
        if (!this.config.lens) return []
        const lens = getLensContract(this.config.lens, web3)
        if (lens === null) return []
        const [plyRewardSupplySpeed, plyRewardBorrowSpeed, auroraRewardSupplySpeed, auroraRewardBorrowSpeed] =
            await lens.methods.getRewardSpeeds(this.config.comptroller, this.stakeToken.address).call()
        return [
            {
                symbol: auRewardTokenSymbol,
                speed: new BigNumber(plyRewardSupplySpeed),
            },
        ]
    }
}
