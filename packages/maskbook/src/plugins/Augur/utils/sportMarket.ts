import { Team, Sport, SportMarketType, MarketTitle, Outcome, SportType, NAMING_TEAM, NAMING_LINE } from '../types'
import { BigNumber as BN } from 'bignumber.js'
import { AWAY_TEAM_OUTCOME, NO_CONTEST, NO_CONTEST_OUTCOME_ID, NO_CONTEST_TIE } from '../constants'
import { getFullTeamName } from '.'
import { isSameAddress } from '@masknet/web3-shared'

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
    const sportsMarketType = new BN(_sportsMarketType).toNumber()
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
    const { title = '', description = '' } =
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
        if (!line) return
        // spread
        // line for home team outcome
        let displayLine = line && line > 0 ? `+${line}` : `${line}`
        if (outcomeId === AWAY_TEAM_OUTCOME) {
            const invertedLine = line * -1
            displayLine = line < 0 ? `+${invertedLine}` : `${invertedLine}`
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
): MarketTitle | undefined => {
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
        if (!line) return

        let fav = awayTeam
        let underdog = homeTeam
        if (line < 0) {
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

const getSportsTitles = (sportId: string, sportsMarketType: number): MarketTitle | undefined => {
    const sportData = sportsData[sportId as keyof typeof sportsData]
    if (!sportData) return
    return sportData.types[sportsMarketType as SportMarketType]
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
            isWinner: hasWinner && isSameAddress(shareToken, winner) ? true : false,
            isFinalNumerator: false, // need to translate final numerator payout hash to outcome
            shareToken,
        } as Outcome
    })
}

const sportsData = {
    [SportType.NFL]: {
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
    [SportType.MLB]: {
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
    [SportType.NBA]: {
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
    [SportType.NHL]: {
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
    [SportType.MMA]: {
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
