import Teams from '../constants/teams.json'
import Sports from '../constants/sports.json'
import {
    TeamsInterface,
    SportsInterface,
    Team,
    Sport,
    Market,
    SportMarketType,
    SportTitles,
    AmmExchange,
    AmmOutcome,
    EstimateTradeResult,
} from '../types'
import { BigNumber as BN } from 'bignumber.js'
import {
    AWAY_TEAM_OUTCOME,
    NAMING_LINE,
    NAMING_TEAM,
    NO_CONTEST,
    NO_CONTEST_OUTCOME_ID,
    NO_CONTEST_TIE,
    SWAP_FEE_DECIMALS,
} from '../constants'
import { formatAmount, formatBalance, FungibleTokenDetailed } from '@masknet/web3-shared'
import { calcSellCompleteSets, estimateBuy } from './bmath'

export const getTeam = (id: string) => {
    return (Teams as TeamsInterface)[id]
}

export const getFullTeamName = (team: Team) => {
    return `${team.name} ${team.mascot}`
}

export const getSport = (id: string) => {
    return (Sports as SportsInterface)[id]
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
    } catch (e) {
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

export const deriveSportMarketInfo = (
    address: string,
    id: string,
    awayTeam: Team,
    endDate: Date,
    homeTeam: Team,
    sport: Sport,
    _sportsMarketType: string,
    shareTokens: string[],
    value0: string,
    winner: string,
    hasWinner: boolean,
) => {
    let line = new BN(String(value0)).div(10).decimalPlaces(0, 1).toNumber() || undefined
    const sportsMarketType = new BN(String(_sportsMarketType)).toNumber()
    if (sportsMarketType === SportMarketType.HeadToHead) line = undefined

    const homeTeamName = getFullTeamName(homeTeam)
    const awayTeamName = getFullTeamName(awayTeam)

    const outcomes = decodeOutcomes(
        shareTokens,
        sport.sportId,
        homeTeamName,
        awayTeamName,
        sportsMarketType,
        line,
        winner,
        hasWinner,
    )
    const { title, description } =
        getMarketTitle(sport.sportId, homeTeamName, awayTeamName, sportsMarketType, line) || {}

    return {
        address,
        id,
        awayTeam,
        endDate,
        homeTeam,
        sport,
        sportsMarketType,
        shareTokens,
        value0,
        winner,
        hasWinner,
        title,
        description,
        outcomes,
        spreadLine: line,
    }
}

const getOutcomeName = (
    outcomeId: number,
    sportId: string,
    homeTeam: string,
    awayTeam: string,
    sportsMarketType: number,
    line: number | undefined,
) => {
    const marketOutcome = getMarketOutcome(sportId, sportsMarketType, outcomeId)
    // create outcome name using market type and line
    if (outcomeId === NO_CONTEST_OUTCOME_ID) return marketOutcome

    if (sportsMarketType === SportMarketType.HeadToHead) {
        return populateHomeAway(marketOutcome, homeTeam, awayTeam)
    }

    if (sportsMarketType === SportMarketType.Spread) {
        // spread
        // line for home team outcome
        let displayLine = Number(line) > 0 ? `+${line}` : `${line}`
        if (outcomeId === AWAY_TEAM_OUTCOME) {
            const invertedLine = Number(line) * -1
            displayLine = Number(line) < 0 ? `+${invertedLine}` : `${invertedLine}`
        }

        const outcome = populateHomeAway(marketOutcome, homeTeam, awayTeam).replace(
            NAMING_LINE.SPREAD_LINE,
            displayLine,
        )
        return outcome
    }

    if (sportsMarketType === SportMarketType.OverUnder) {
        // over/under
        return marketOutcome.replace(NAMING_LINE.OVER_UNDER_LINE, String(line))
    }

    return `Outcome ${outcomeId}`
}

const getMarketTitle = (
    sportId: string,
    homeTeam: string,
    awayTeam: string,
    sportsMarketType: number,
    line: number | undefined,
): SportTitles | undefined => {
    const marketTitles = getSportsTitles(sportId, sportsMarketType)
    if (!marketTitles) {
        return
    }
    let title = ''
    let description = ''
    if (sportsMarketType === SportMarketType.HeadToHead) {
        title = marketTitles.title
        description = populateHomeAway(marketTitles.description, homeTeam, awayTeam)
    }

    if (sportsMarketType === SportMarketType.Spread && !!line) {
        let fav = awayTeam
        let underdog = homeTeam
        if (Number(line) < 0) {
            underdog = awayTeam
            fav = homeTeam
        }
        let spread = new BN(line).abs().toNumber()
        if (!Number.isInteger(spread)) {
            spread = Math.trunc(spread)
        }
        title = marketTitles.title
            .replace(NAMING_TEAM.FAV_TEAM, fav)
            .replace(NAMING_TEAM.UNDERDOG_TEAM, underdog)
            .replace(NAMING_LINE.SPREAD_LINE, String(spread))
    }

    if (sportsMarketType === SportMarketType.OverUnder) {
        title = marketTitles.title.replace(NAMING_LINE.OVER_UNDER_LINE, String(line))
        description = populateHomeAway(marketTitles.description, homeTeam, awayTeam)
    }
    return { title, description }
}

const populateHomeAway = (marketTitle: string, homeTeam: string, awayTeam: string): string => {
    return marketTitle.replace(NAMING_TEAM.AWAY_TEAM, awayTeam).replace(NAMING_TEAM.HOME_TEAM, homeTeam)
}

const getSportsTitles = (sportId: string, sportsMarketType: number): SportTitles | undefined => {
    const sportData = sportsData[sportId as keyof typeof sportsData]
    if (!sportData) return
    return sportData.types[sportsMarketType as SportMarketType]
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

const getMarketOutcome = (sportId: string, sportsMarketType: number, outcomeId: number): string => {
    const sportData = sportsData[sportId as keyof typeof sportsData]
    if (!sportData) {
        return ''
    }
    const data = sportData.types[sportsMarketType as SportMarketType]
    if (!data.outcomes) {
        return ''
    }
    return data.outcomes[outcomeId]
}

export const getRawFee = (swapFee: string) => {
    return formatAmount(new BN(swapFee ?? ''), SWAP_FEE_DECIMALS - 2)
}

const decodeOutcomes = (
    shareTokens: string[] = [],
    sportId: string,
    homeTeam: string,
    awayTeam: string,
    sportsMarketType: number,
    line: number | undefined,
    winner: string,
    hasWinner: boolean,
) => {
    return shareTokens.map((shareToken, i) => {
        return {
            id: i,
            name: getOutcomeName(i, sportId, homeTeam, awayTeam, sportsMarketType, line),
            symbol: shareToken,
            isInvalid: i === NO_CONTEST_OUTCOME_ID,
            isWinner: hasWinner && shareToken === winner ? true : false,
            isFinalNumerator: false, // need to translate final numerator payout hash to outcome
            shareToken,
        }
    })
}

const sportsData = {
    '2': {
        name: 'NFL',
        types: {
            [SportMarketType.HeadToHead]: {
                title: `Which team will win?`,
                description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
                outcomes: [NO_CONTEST_TIE, `${NAMING_TEAM.AWAY_TEAM}`, `${NAMING_TEAM.HOME_TEAM}`],
            },
            [SportMarketType.Spread]: {
                title: `Will the ${NAMING_TEAM.FAV_TEAM} defeat the ${NAMING_TEAM.UNDERDOG_TEAM} by more than ${NAMING_LINE.SPREAD_LINE}.5 points?`,
                description: ``,
                outcomes: [
                    NO_CONTEST,
                    `${NAMING_TEAM.AWAY_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
                    `${NAMING_TEAM.HOME_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
                ],
            },
            [SportMarketType.OverUnder]: {
                title: `Will there be over ${NAMING_LINE.OVER_UNDER_LINE}.5 total points scored?`,
                description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
                outcomes: [
                    NO_CONTEST,
                    `Over ${NAMING_LINE.OVER_UNDER_LINE}.5`,
                    `Under ${NAMING_LINE.OVER_UNDER_LINE}.5`,
                ],
            },
        },
    },
    '3': {
        name: 'MLB',
        types: {
            [SportMarketType.HeadToHead]: {
                title: `Which team will win?`,
                description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
                outcomes: [NO_CONTEST, `${NAMING_TEAM.AWAY_TEAM}`, `${NAMING_TEAM.HOME_TEAM}`],
            },
            [SportMarketType.Spread]: {
                title: `Will the ${NAMING_TEAM.FAV_TEAM} defeat the ${NAMING_TEAM.UNDERDOG_TEAM} by more than ${NAMING_LINE.SPREAD_LINE}.5 runs?`,
                description: ``,
                outcomes: [
                    NO_CONTEST,
                    `${NAMING_TEAM.AWAY_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
                    `${NAMING_TEAM.HOME_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
                ],
            },
            [SportMarketType.OverUnder]: {
                title: `Will there be over ${NAMING_LINE.OVER_UNDER_LINE}.5 total runs scored?`,
                description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
                outcomes: [
                    NO_CONTEST,
                    `Over ${NAMING_LINE.OVER_UNDER_LINE}.5`,
                    `Under ${NAMING_LINE.OVER_UNDER_LINE}.5`,
                ],
            },
        },
    },
    '4': {
        name: 'NBA',
        types: {
            [SportMarketType.HeadToHead]: {
                title: `Which team will win?`,
                description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}?`,
                outcomes: [NO_CONTEST, `${NAMING_TEAM.AWAY_TEAM}`, `${NAMING_TEAM.HOME_TEAM}`],
            },
            [SportMarketType.Spread]: {
                title: `Will the ${NAMING_TEAM.FAV_TEAM} defeat the ${NAMING_TEAM.UNDERDOG_TEAM} by more than ${NAMING_LINE.SPREAD_LINE}.5 points?`,
                description: ``,
                outcomes: [
                    NO_CONTEST,
                    `${NAMING_TEAM.AWAY_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
                    `${NAMING_TEAM.HOME_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
                ],
            },
            [SportMarketType.OverUnder]: {
                title: `Will there be over ${NAMING_LINE.OVER_UNDER_LINE}.5 total points scored?`,
                description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
                outcomes: [
                    NO_CONTEST,
                    `Over ${NAMING_LINE.OVER_UNDER_LINE}.5`,
                    `Under ${NAMING_LINE.OVER_UNDER_LINE}.5`,
                ],
            },
        },
    },
    '6': {
        name: 'NHL',
        types: {
            [SportMarketType.HeadToHead]: {
                title: `Which team will win?`,
                description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
                outcomes: [NO_CONTEST, `${NAMING_TEAM.AWAY_TEAM}`, `${NAMING_TEAM.HOME_TEAM}`],
            },
            [SportMarketType.Spread]: {
                title: `Will the ${NAMING_TEAM.FAV_TEAM} defeat the ${NAMING_TEAM.UNDERDOG_TEAM} by more than ${NAMING_LINE.SPREAD_LINE}.5 goals?`,
                description: ``,
                outcomes: [
                    NO_CONTEST,
                    `${NAMING_TEAM.AWAY_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
                    `${NAMING_TEAM.HOME_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
                ],
            },
            [SportMarketType.OverUnder]: {
                title: `Will there be over ${NAMING_LINE.OVER_UNDER_LINE}.5 total goals scored?`,
                description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
                outcomes: [
                    NO_CONTEST,
                    `Over ${NAMING_LINE.OVER_UNDER_LINE}.5`,
                    `Under ${NAMING_LINE.OVER_UNDER_LINE}.5`,
                ],
            },
        },
    },
    '7': {
        name: 'MMA',
        types: {
            [SportMarketType.HeadToHead]: {
                title: `Who will win?`,
                description: `${NAMING_TEAM.HOME_TEAM} vs ${NAMING_TEAM.AWAY_TEAM}`,
                outcomes: [NO_CONTEST, `${NAMING_TEAM.HOME_TEAM}`, `${NAMING_TEAM.AWAY_TEAM}`],
            },
            [SportMarketType.Spread]: {
                title: ``,
                description: ``,
                outcomes: [],
            },
            [SportMarketType.OverUnder]: {
                title: `Will fight go the distance?`,
                description: ``,
                outcomes: [NO_CONTEST, `Yes`, `No`],
            },
        },
    },
}

const sportsResolutionRules = {
    '2': {
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
    '3': {
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
    '4': {
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
    '6': {
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
    '7': {
        types: {
            [SportMarketType.HeadToHead]: [
                `A fight is considered official once the first round begins, regardless of the scheduled or actual duration.`,
                `Market resolves based on the official result immediately following the fight. Later announcements, enquirers, or changes to the official result will not affect market settlement.`,
                `If a fighter is substituted before the fight begins the market should resolve as "Draw/No Contest".`,
                `If a fighter is disqualified during the fight, the opposing fighter should be declared the winner. If both fighters are disqualified the market should resolve as "Draw/No Contest".`,
                `If the fight is cancelled before it starts for any reason, the market should resolve as 'No Contest'.`,
                `A draw can occur when the fight is either stopped before completion or after all rounds are completed and goes to the judges' scorecards for decision. If the match ends in a draw, only the “Draw/No Contest” result should be the winning outcome`,
            ],
            [SportMarketType.Spread]: [],
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
