import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import CompoundTimestampBasedProtocol from './CompoundTimestampBasedProtocol'
import type { FungibleTokenDetailed, ChainId } from '@masknet/web3-shared-evm'
import { createContract } from '@masknet/web3-shared-evm'
import { isZero, ZERO } from '@masknet/web3-shared-base'
import type { BenQiComptroller } from '@masknet/web3-contracts/types/BenQiComptroller'
import BenQiComptrollerABI from '@masknet/web3-contracts/abis/BenQiComptroller.json'
import type { BenqiChainlinkOracle } from '@masknet/web3-contracts/types/BenqiChainlinkOracle'
import BenqiChainlinkOracleABI from '@masknet/web3-contracts/abis/BenqiChainlinkOracle.json'

export const emptyRewardType = -1
export type RewardToken = {
    symbol: string
    rewardType: number
}

export type RewardSpeed = {
    symbol: string
    speed: BigNumber
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
        readonly rewardTokens: RewardToken[],
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
        notInPairTokens: RewardToken[],
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
                // https://snowtrace.io/tx/0x68a0a82884299df30c33a4ac36d32d247db7e3fa379cd41a1a1bc2f07f4cb173
                // `rewardSpeeds` renamed `supplyRewardSpeeds` since May-02-2022 09:47:38 AM
                const speed = await comptroller.methods.supplyRewardSpeeds(rewardType, this.stakeToken.address).call()
                return {
                    speed: new BigNumber(speed),
                    symbol,
                } as RewardSpeed
            }),
        )
    }

    // include rewardToken and stakeToken
    public async getAllNeedFetchPricePairs() {
        const allTokens = [
            {
                symbol: this.stakeToken.symbol,
                rewardType: emptyRewardType,
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
        let allPrice: MarketStatus[] = []
        try {
            allPrice = await this.fetchPrices(needLoadPricePairs, notInPairTokens, web3)
        } catch (error) {
            console.error('BenQiRewardProtocol.fetchPrices', error)
        }
        let currentMarketSpeeds: RewardSpeed[] = []
        try {
            currentMarketSpeeds = await this.fetchSpeeds(web3)
        } catch (error) {
            console.error('BenQiRewardProtocol.fetchSpeeds', error)
        }
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
            // can not fetch the price
            if (!marketPrice) return ZERO
            if (marketPrice && isZero(marketPrice)) {
                return ZERO
            }

            const totalPrice = marketPrice ? totalSupplyAmount.times(marketPrice) : ZERO
            const rewardsAPR = this.rewardTokens.map(({ symbol }) => {
                // price not found
                if (!symbolWithPrice[symbol]) {
                    return {
                        apr: ZERO,
                    }
                }
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
                    marketPrice: marketPrice ? marketPrice.toString(10) : 0,
                    rewardPrice: rewardPrice.toString(10),
                    rewardPerDay: rewardPerDay.toString(10),
                    rewardValue: rewardValue.toString(10),
                    supplyBase: supplyBase.toString(10),
                    rewardSpeed: rewardSpeed.toString(10),
                    totalPrice: totalPrice.toString(10),
                    aprDisplay: supply.toString(10),
                    apr: supply,
                }
            })

            let totalDistributionAPR = ZERO
            rewardsAPR.forEach((item) => {
                totalDistributionAPR = totalDistributionAPR.plus(item.apr)
            })
            return totalDistributionAPR
        } catch (error) {
            console.error('getDistributionAPR', error)
            return ZERO
        }
    }
}
