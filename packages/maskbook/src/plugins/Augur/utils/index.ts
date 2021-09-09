import {
    SportsInterface,
    Team,
    Market,
    AmmExchange,
    AmmOutcome,
    EstimateTradeResult,
    SportMarketType,
    SportType,
} from '../types'
import { BigNumber as BN } from 'bignumber.js'
import { MINIMUM_BALANCE, SWAP_FEE_DECIMALS } from '../constants'
import { formatAmount, formatBalance, FungibleTokenDetailed, ZERO } from '@masknet/web3-shared'
import { calcSellCompleteSets, estimateBuy } from './bmath'
import Sports from '../constants/sports'

export const getTeam = (id: string, sportId: SportType) => {
    return Sports[sportId].teams[id]
}

export const getFullTeamName = (team: Team) => {
    return `${team.name} ${team.mascot}`
}

export const getSport = (id: string) => {
    return (Sports as SportsInterface)[id]
}
export const rawToFixed = (amount: string, decimals: number, accuracy: number) => {
    const displayAmount = new BN(formatBalance(amount, decimals))
    const fixedAmount = displayAmount.toFixed(accuracy, BN.ROUND_DOWN)
    return formatAmount(fixedAmount, decimals)
}

export const getRawFee = (swapFee: string) => {
    return formatAmount(new BN(swapFee ?? ''), SWAP_FEE_DECIMALS - 2)
}

export const estimateBuyTrade = (
    amm: AmmExchange,
    inputDisplayAmount: string,
    outcome: AmmOutcome,
    fee: string,
    cash: FungibleTokenDetailed,
    shareDecimals: number,
): EstimateTradeResult | undefined => {
    if (!inputDisplayAmount || !new BN(inputDisplayAmount).gte(0)) return
    let result
    const amount = formatAmount(inputDisplayAmount, cash.decimals)

    try {
        result = estimateBuy(amm.shareFactor, outcome.id, amount, amm.balances, amm.weights, fee)
    } catch (error) {
        if (!result) return
    }

    const decimalFee = formatBalance(fee, SWAP_FEE_DECIMALS)
    const estimatedShares = formatBalance(result, shareDecimals)
    const tradeFees = new BN(inputDisplayAmount).multipliedBy(decimalFee).toString()
    const averagePrice = new BN(inputDisplayAmount).div(new BN(estimatedShares)).toString()
    const maxProfit = new BN(estimatedShares).minus(new BN(inputDisplayAmount)).toString()
    const price = new BN(outcome.rate)
    const priceImpact = price.minus(averagePrice).div(price).multipliedBy(100).toString()
    const ratePerCash = new BN(estimatedShares).div(new BN(inputDisplayAmount)).toString()

    return {
        outputValue: estimatedShares,
        tradeFees,
        averagePrice,
        maxProfit,
        ratePerCash,
        priceImpact,
    }
}

export const estimateSellTrade = (
    amm: AmmExchange,
    inputDisplayAmount: string,
    outcome: AmmOutcome,
    userBalance: string,
    shareTokenDecimals: number,
    fee: string,
): EstimateTradeResult | undefined => {
    if (!inputDisplayAmount || !new BN(inputDisplayAmount).gte(0)) return

    const amount = formatAmount(inputDisplayAmount, shareTokenDecimals)
    const decimalFee = formatBalance(fee, SWAP_FEE_DECIMALS)
    const [setsOut, undesirableTokensInPerOutcome] = calcSellCompleteSets(
        amm.shareFactor,
        outcome.id,
        amount,
        amm.balances,
        amm.weights,
        fee,
    )

    let maxSellAmount = '0'
    const completeSets = formatBalance(setsOut, shareTokenDecimals)
    const tradeFees = new BN(inputDisplayAmount).times(new BN(decimalFee)).toString()

    const displayAmount = new BN(inputDisplayAmount)
    const averagePrice = new BN(completeSets).div(displayAmount)
    const price = new BN(outcome.rate)
    const priceImpact = averagePrice.minus(price).times(100).toFixed(4)
    const ratePerCash = new BN(completeSets).div(displayAmount).toFixed(6)
    const displayShares = formatBalance(userBalance, shareTokenDecimals)
    const sumUndesirable = (undesirableTokensInPerOutcome || []).reduce((p, u) => p.plus(new BN(u)), new BN(0))
    const canSellAll = new BN(amount).minus(sumUndesirable).abs()
    const remainingShares = new BN(displayShares || '0').minus(displayAmount)

    if (remainingShares.isLessThan(0)) return
    if (canSellAll.gte(new BN(amm.shareFactor))) {
        maxSellAmount = formatBalance(sumUndesirable)
    }

    return {
        outputValue: completeSets,
        tradeFees,
        averagePrice: averagePrice.toFixed(2),
        maxProfit: undefined,
        ratePerCash,
        remainingShares: remainingShares.toFixed(6),
        priceImpact,
        outcomeShareTokensIn: undesirableTokensInPerOutcome, // just a pass through to sell trade call
        maxSellAmount,
    }
}

export const getResolutionRules = (market: Market): string[] => {
    if (
        !market.sport.sportId ||
        market?.sportsMarketType === undefined ||
        !sportsResolutionRules[market.sport.sportId as keyof typeof sportsResolutionRules]
    )
        return []
    const { sport, sportsMarketType } = market
    return sportsResolutionRules[sport.sportId as keyof typeof sportsResolutionRules]?.types[sportsMarketType]
}

export const significantOfAmount = (amount: BN) => {
    if (amount.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 1000)) return 4
    if (amount.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 100)) return 3
    if (amount.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 10)) return 2
    if (amount.isGreaterThanOrEqualTo(MINIMUM_BALANCE)) return 1
    return 4
}

const calculatePrices = (
    market: { outcomes: AmmOutcome[]; hasWinner: boolean },
    ratios: string[] = [],
    weights: string[] = [],
): string[] => {
    let outcomePrices: string[] = []
    if (!market) {
        return []
    }
    const { outcomes, hasWinner } = market
    if (hasWinner) {
        return outcomes.map((outcome) => (outcome.isWinner ? '1' : '0'))
    }
    //price[0] = ratio[0] / sum(ratio)
    const base = ratios.length > 0 ? ratios : weights
    if (base.length > 0) {
        const sum = base.reduce((p, r) => p.plus(new BN(String(r))), ZERO)
        outcomePrices = base.map((r) => new BN(String(r)).div(sum).toFixed())
    }
    return outcomePrices
}

export const calcPricesFromOdds = (initialOdds: string[], outcomes: AmmOutcome[]) => {
    // convert odds to prices and set prices on outcomes
    const outcomePrices = calculatePrices({ outcomes, hasWinner: false }, initialOdds, [])
    const populatedOutcomes = outcomes.map((o, i) => ({ ...o, rate: new BN(outcomePrices[i]) }))
    return populatedOutcomes
}

const sportsResolutionRules = {
    [SportType.NFL]: {
        types: {
            [SportMarketType.HeadToHead]: [
                `At least 55 minutes of play must have elapsed for the game to be deemed official. If the game is not played or if less than 55 minutes of play have been completed, the game is not considered
an official game and the market should resolve as 'No Contest'.`,
                `Overtime counts towards settlement purposes.`,
                `If the game ends in a tie, the market should resolve as 'No Contest'`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games,
protests, or overturned decisions.`,
            ],
            [SportMarketType.Spread]: [
                `At least 55 minutes of play must have elapsed for the game to be deemed official. If the game is
not played or if less than 55 minutes of play have been completed, the game is not considered
an official game and the market should resolve as 'No Contest'.`,
                `Overtime counts towards settlement purposes.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games,
protests, or overturned decisions.`,
            ],
            [SportMarketType.OverUnder]: [
                `At least 55 minutes of play must have elapsed for the game to be deemed official. If the game is
not played or if less than 55 minutes of play have been completed, the game is not considered
an official game and the market should resolve as 'No Contest'.`,
                `Overtime count towards settlement purposes.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games,
protests, or overturned decisions.`,
            ],
        },
    },
    [SportType.MLB]: {
        types: {
            [SportMarketType.HeadToHead]: [
                `The results of a game are official after (and, unless otherwise stated, bets shall be settled subject to the completion of) 5 innings of play, or 4.5 innings should the home team be leading at the commencement of the bottom of the 5th innings. Should a game be called, if the result is official in accordance with this rule, the winner will be determined by the score/stats after the last completed inning.`,
                `If the game does not reach the "official” time limit, or ends in a tie, the market should resolve as 'No Contest'.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Extra innings count towards settlement purposes.`,
                `Results are determined by the natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
            [SportMarketType.Spread]: [
                `The results of a game are official after (and, unless otherwise stated, bets shall be settled subject to the completion of) 5 innings of play, or 4.5 innings should the home team be leading at the commencement of the bottom of the 5th innings. Should a game be called, if the result is official in accordance with this rule, the winner will be determined by the score/stats after the last completed inning.`,
                `If the game does not reach the "official” time limit, or ends in a tie, the market should resolve as 'No Contest'.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Extra innings count towards settlement purposes.`,
                `Results are determined by their natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
            [SportMarketType.OverUnder]: [
                `The results of a game are official after (and, unless otherwise stated, bets shall be settled subject to the completion of) 5 innings of play, or 4.5 innings should the home team be leading at the commencement of the bottom of the 5th innings. Should a game be called, if the result is official in accordance with this rule, the winner will be determined by the score/stats after the last completed inning.`,
                `If the game does not reach the "official” time limit, the market should resolve as 'No Contest'.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Extra innings count towards settlement purposes.`,
                `Results are determined by their natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
        },
    },
    [SportType.NBA]: {
        types: {
            [SportMarketType.HeadToHead]: [
                `At least 43 minutes of play must have elapsed for the game to be deemed official. If the game is not played or if less than 43 minutes of play have been completed, the game is not considered an official game and the market should resolve as 'No Contest'.`,
                `Overtime count towards settlement purposes.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
            [SportMarketType.Spread]: [
                `At least 43 minutes of play must have elapsed for the game to be deemed official. If the game is not played or if less than 43 minutes of play have been completed, the game is not considered an official game and the market should resolve as 'No Contest'.`,
                `Overtime count towards settlement purposes.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
            [SportMarketType.OverUnder]: [
                `At least 43 minutes of play must have elapsed for the game to be deemed official. If the game is not played or if less than 43 minutes of play have been completed, the game is not considered an official game and the market should resolve as 'No Contest'.`,
                `Overtime count towards settlement purposes.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
        },
    },
    [SportType.NHL]: {
        types: {
            [SportMarketType.HeadToHead]: [
                `At least 55 minutes of play must have elapsed for the game to be deemed official. If the game is not played or if less than 55 minutes of play have been completed, the game is not considered an official game and the market should resolve as 'No Contest'.`,
                `Overtime and any shoot-outs count towards settlement purposes.`,
                `If the game ends in a tie, the market should resolve as 'No Contest'`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
            [SportMarketType.Spread]: [
                `At least 55 minutes of play must have elapsed for the game to be deemed official. If the game is not played or if less than 55 minutes of play have been completed, the game is not considered an official game and the market should resolve as 'No Contest'.`,
                `Overtime and any shoot-outs count towards settlement purposes.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
            [SportMarketType.OverUnder]: [
                `At least 55 minutes of play must have elapsed for the game to be deemed official. If the game is not played or if less than 55 minutes of play have been completed, the game is not considered an official game and the market should resolve as 'No Contest'.`,
                `Overtime and any shoot-outs count towards settlement purposes.`,
                `If the game is not played, the market should resolve as 'No Contest'.`,
                `Results are determined by their natural conclusion and do not recognize postponed games, protests, or overturned decisions.`,
            ],
        },
    },
    [SportType.MMA]: {
        types: {
            [SportMarketType.HeadToHead]: [
                `A fight is considered official once the first round begins, regardless of the scheduled or actual duration.`,
                `Market resolves based on the official result immediately following the fight. Later announcements, enquirers, or changes to the official result will not affect market settlement.`,
                `If a fighter is substituted before the fight begins the market should resolve as "Draw/No Contest".`,
                `If a fighter is disqualified during the fight, the opposing fighter should be declared the winner. If both fighters are disqualified the market should resolve as "Draw/No Contest".`,
                `If the fight is cancelled before it starts for any reason, the market should resolve as 'No Contest'.`,
                `A draw can occur when the fight is either stopped before completion or after all rounds are completed and goes to the judges' scorecards for decision. If the match ends in a draw, only the “Draw/No Contest” result should be the winning outcome`,
            ],
            [SportMarketType.Spread]: [
                `A fight is considered official once the first round begins, regardless of the scheduled or actual duration.`,
                `Market resolves based on the official result immediately following the fight. Later announcements, enquirers, or changes to the official result will not affect market settlement.`,
                `If a fighter is substituted before the fight begins the market should resolve as "Draw/No Contest".`,
                `If the fight is cancelled before it starts for any reason, the market should resolve as 'No Contest'.`,
                `If the official time is exactly on (equal to) the over/under number the market should resolve as “Over”.`,
                `Markets referring to round/fight duration represents the actual time passed in the round/fight, as applicable, depending on the scheduled round/fight duration. For example Over 2.5 Total Rounds will be settled as “Over” once two and a half minutes or more in the 3rd Round has passed.`,
            ],
            [SportMarketType.OverUnder]: [
                `A fight is considered official once the first round begins, regardless of the scheduled or actual duration.`,
                `Market resolves based on the official result immediately following the fight. Later announcements, enquirers, or changes to the official result will not affect market settlement.`,
                `If a fighter is substituted before the fight begins the market should resolve as "Draw/No Contest".`,
                `If the fight is cancelled before it starts for any reason, the market should resolve as 'No Contest'.`,
                `If the official time is exactly on (equal to) the over/under number the market should resolve as “Over”.`,
                `Markets referring to round/fight duration represents the actual time passed in the round/fight, as applicable, depending on the scheduled round/fight duration. For example Over 2.5 Total Rounds will be settled as “Over” once two and a half minutes or more in the 3rd Round has passed.`,
            ],
        },
    },
}
