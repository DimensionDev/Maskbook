import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import CompoundTimestampBasedProtocol from './CompoundTimestampBasedProtocol'
import type { FungibleTokenDetailed, ChainId } from '@masknet/web3-shared-evm'
import { createContract } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import type { BenQiComptroller } from '@masknet/web3-contracts/types/BenQiComptroller'
import BenQiComptrollerABI from '@masknet/web3-contracts/abis/BenQiComptroller.json'
// import { BENQI_COMPTROLLER } from '../../constants'
// import type { RewardToken } from './pairs'
import type { BenqiChainlinkOracle } from '@masknet/web3-contracts/types/BenqiChainlinkOracle'
import BenqiChainlinkOracleABI from '@masknet/web3-contracts/abis/BenqiChainlinkOracle.json'

export type RewardToken = {
    symbol: string
    rewardType: number
}

export type PairConfig = {
    oracle: string
    comptroller: string
    lens?: string
}
export type MarketStatus = {
    symbol: string
    price: BigNumber
}

export type IndexWithStatus = {
    [key: string]: MarketStatus
}

export function getBenQiComptrollerContract(address: string, web3: Web3) {
    return createContract<BenQiComptroller>(web3, address, BenQiComptrollerABI as AbiItem[])
}

export function getBenQiOracleComptrollerContract(address: string, web3: Web3) {
    return createContract<BenqiChainlinkOracle>(web3, address, BenqiChainlinkOracleABI as AbiItem[])
}

export default class BenQiRewardProtocol extends CompoundTimestampBasedProtocol {
    constructor(
        pair: [FungibleTokenDetailed, FungibleTokenDetailed],
        nativeToken: string,
        readonly allPairs: [[FungibleTokenDetailed, FungibleTokenDetailed]],
        readonly rewardTokens: Array<RewardToken>,
        readonly config: PairConfig,
    ) {
        super(pair, nativeToken)
    }

    // load price
    public async fetchPrices(
        matchPairs: Array<{
            underlying: FungibleTokenDetailed
            market: FungibleTokenDetailed
        }>,
        notInPairTokens: Array<RewardToken>,
        web3: Web3,
    ) {
        const oracle = getBenQiOracleComptrollerContract(this.config.oracle, web3)
        if (oracle === null) return []
        return Promise.all(
            matchPairs
                .filter((_) => _.market.symbol !== undefined)
                .map(async (item) => {
                    const { underlying, market } = item
                    const price = await oracle.methods.getUnderlyingPrice(market.address).call()
                    // https://github.com/Benqi-fi/BENQI-Smart-Contracts/blob/master/Chainlink/BenqiChainlinkOracle.sol#L43
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
    }

    // load reward token speed
    public async fetchSpeeds(web3: Web3) {
        const comptroller = getBenQiComptrollerContract(this.config.comptroller, web3)
        if (comptroller === null) return []
        return Promise.all(
            this.rewardTokens.map(async ({ rewardType, symbol }) => {
                const speed = await comptroller.methods.rewardSpeeds(rewardType, this.stakeToken.address).call()
                return {
                    speed: new BigNumber(speed),
                    symbol,
                }
            }),
        )
    }

    // include rewardToken and stakeToken
    public async getAllNeedFetchPricePairs() {
        const allTokens = [
            {
                symbol: this.stakeToken.symbol,
                rewardType: -1,
            },
        ].concat(this.rewardTokens)
        const matchPairs = this.allPairs
            .filter(
                (pair: [FungibleTokenDetailed, FungibleTokenDetailed]) =>
                    pair[1]?.symbol && allTokens.find((item) => item.symbol === pair[1].symbol),
            )
            .map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
                return {
                    underlying: pair[0],
                    market: pair[1],
                }
            })

        const notMatchTokens = this.rewardTokens.filter(
            (rewardToken: RewardToken) => !this.allPairs.find((item) => rewardToken.symbol === item[1].symbol),
        )

        return {
            matchPairs,
            notMatchTokens,
        }
    }

    public async loadMarketPriceAndSpeed(comptroller: BenQiComptroller, web3: Web3) {
        const { matchPairs: needLoadPricePairs, notMatchTokens: notInPairTokens } =
            await this.getAllNeedFetchPricePairs()
        const allPrice = await this.fetchPrices(needLoadPricePairs, notInPairTokens, web3)
        const currentMarketSpeeds = await this.fetchSpeeds(web3)
        const indexBySymbol: IndexWithStatus = {}
        allPrice.forEach((item: MarketStatus) => {
            indexBySymbol[item.symbol] = item
        })
        return {
            allPrices: indexBySymbol,
            currentMarketSpeeds,
        }
    }

    // curRewardsPerDay = curRewardSpeed * 60 * 60 * 24
    // curBaseSupply = curRewardPrice * curRewardsPerDay / assetTotalSupply * assetPrice
    // curRewardSupplyAPR = curBaseSupply * 365
    public override async getDistributionAPR(chainId: ChainId, web3: Web3): Promise<BigNumber.Value> {
        const comptroller = getBenQiComptrollerContract(this.config.comptroller, web3)
        const market = this.getPoolContract(web3)
        if (market === null) return ZERO
        if (comptroller === null) return ZERO

        try {
            const { allPrices: symbolWithPrice, currentMarketSpeeds } = await this.loadMarketPriceAndSpeed(
                comptroller,
                web3,
            )
            //  market supply
            const [totalSupply, exchangeRate] = await Promise.all([
                market.methods.totalSupply().call(),
                market.methods.exchangeRateStored().call(),
            ])

            const bareTokenDecimals = 18 + this.bareToken.decimals
            const totalSupplyAmount = new BigNumber(totalSupply)
                .times(new BigNumber(exchangeRate))
                .shiftedBy(-bareTokenDecimals)

            const marketPrice = this.stakeToken.symbol && symbolWithPrice[this.stakeToken.symbol].price
            const totalPrice = marketPrice ? totalSupplyAmount.times(marketPrice) : ZERO

            const rewardsAPR = this.rewardTokens.map(({ symbol }) => {
                const { price: rewardPrice } = symbolWithPrice[symbol]
                const speedItem = currentMarketSpeeds.find((_) => _.symbol === symbol)
                if (!speedItem)
                    return {
                        apr: ZERO,
                    }
                const { speed: rewardSpeed } = speedItem
                const rewardPerDay = rewardSpeed.shiftedBy(-18).times(60 * 60 * 24)
                const rewardValue = rewardPerDay.times(rewardPrice)
                const supplyBase = rewardValue.div(totalPrice)
                const supply = supplyBase.times(365).times(100)
                return {
                    symbol,
                    // rewardPrice: rewardPrice.toString(10),
                    // rewardPerDay: rewardPerDay.toString(10),
                    // rewardValue: rewardValue.toString(10),
                    // supplyBase: supplyBase.toString(10),
                    // rewardSpeed: rewardSpeed.toString(10),
                    // totalPrice: totalPrice.toString(10),
                    // aprDisplay: supply.toString(10),
                    apr: supply,
                }
            })

            const totalDistributionAPR = rewardsAPR
                .filter((_) => _ !== null)
                .reduce((total, item) => {
                    return total.plus(item.apr)
                }, ZERO)
            // console.log('prices', this.bareToken.symbol, {
            //     totalDistributionAPR: totalDistributionAPR.toString(),
            //     marketPrice: marketPrice?.toString(10),
            //     totalPrice: totalPrice.toString(10),
            //     totalSupply,
            //     exchangeRate,
            //     pair: this.pair,
            //     symbolWithPrice,
            //     rewardsAPR,
            //     totalSupplyAmount: totalSupplyAmount.toString(10),
            // })
            return totalDistributionAPR
        } catch (error) {
            console.error('getDistributionAPR', error)
            return ZERO
        }
    }
}
