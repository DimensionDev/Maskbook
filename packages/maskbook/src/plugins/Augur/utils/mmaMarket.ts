import { isSameAddress } from '@masknet/web3-shared'
import { NO_CONTEST_OUTCOME_ID } from '../constants'
import { MarketTitle, MMA_MARKET_TYPE, Outcome, Sport } from '../types'

const NAMING_TEAM = {
    HOME_TEAM: 'HOME_TEAM',
    AWAY_TEAM: 'AWAY_TEAM',
    FAV_TEAM: 'FAV_TEAM',
    UNDERDOG_TEAM: 'UNDERDOG_TEAM',
}
const NAMING_LINE = {
    SPREAD_LINE: 'SPREAD_LINE',
    OVER_UNDER_LINE: 'OVER_UNDER_LINE',
}
const NO_CONTEST = 'No Contest'
const NO_CONTEST_TIE = 'Draw/No Contest'

export const deriveMmaMarketInfo = (
    address: string,
    id: string,
    endDate: Date,
    awayFighterId: string,
    awayFighterName: string,
    homeFighterId: string,
    homeFighterName: string,
    sport: Sport,
    _sportsMarketType: string,
    shareTokens: string[],
    winner: string,
    hasWinner: boolean,
) => {
    // translate market data
    const line = null
    // will need get get team names
    const sportsMarketType = Number.parseInt(_sportsMarketType, 10)
    const outcomes = decodeOutcomes(shareTokens, homeFighterName, awayFighterName, sportsMarketType, winner, hasWinner)
    const { title, description } =
        getMarketTitle(sport.sportId, homeFighterName, awayFighterName, sportsMarketType) || {}

    return {
        address,
        id,
        endDate,
        sport,
        sportsMarketType,
        shareTokens,
        winner,
        hasWinner,
        title,
        description,
        outcomes,
        spreadLine: line,
        homeTeamId: homeFighterId,
        awayTeamId: awayFighterId,
        sportId: sport.sportId,
    }
}

const getOutcomeName = (outcomeId: number, homeTeam: string, awayTeam: string, sportsMarketType: number) => {
    const marketOutcome = getMarketOutcome(sportsMarketType, outcomeId)
    // create outcome name using market type and line
    if (outcomeId === NO_CONTEST_OUTCOME_ID) return marketOutcome

    if (sportsMarketType === MMA_MARKET_TYPE.MONEY_LINE) {
        return populateHomeAway(marketOutcome, homeTeam, awayTeam)
    }

    return `Outcome ${outcomeId}`
}

export const getMarketTitle = (
    sportId: string,
    homeTeam: string,
    awayTeam: string,
    sportsMarketType: number,
): MarketTitle | undefined => {
    const marketTitle = getSportsTitles(sportsMarketType)
    if (!marketTitle) {
        return
    }
    let title = ''
    let description = ''
    if (sportsMarketType === 0) {
        // head to head (money line)
        title = marketTitle.title
        description = populateHomeAway(marketTitle.description, homeTeam, awayTeam)
    }

    return { title, description }
}

const populateHomeAway = (marketTitle: string, homeTeam: string, awayTeam: string): string => {
    return marketTitle.replace(NAMING_TEAM.AWAY_TEAM, awayTeam).replace(NAMING_TEAM.HOME_TEAM, homeTeam)
}

const getSportsTitles = (sportsMarketType: number): MarketTitle | undefined => {
    if (!sportsData[sportsMarketType]) return
    return sportsData[sportsMarketType]
}

const getMarketOutcome = (sportsMarketType: number, outcomeId: number): string => {
    if (!sportsData[sportsMarketType]) {
        return ''
    }
    const data = sportsData[sportsMarketType]
    if (!data?.outcomes) {
        return ''
    }
    return data.outcomes[outcomeId]
}

const decodeOutcomes = (
    shareTokens: string[] = [],
    homeTeam: string,
    awayTeam: string,
    sportsMarketType: number,
    winner: string,
    hasWinner: boolean,
) => {
    return shareTokens.map((shareToken, i) => {
        return {
            id: i,
            name: getOutcomeName(i, homeTeam, awayTeam, sportsMarketType), // todo: derive outcome name using market data
            symbol: shareToken,
            isInvalid: i === NO_CONTEST_OUTCOME_ID,
            isWinner: hasWinner && isSameAddress(shareToken, winner) ? true : false,
            isFinalNumerator: false, // need to translate final numerator payout hash to outcome
            shareToken,
        } as Outcome
    })
}

const sportsData = {
    [MMA_MARKET_TYPE.MONEY_LINE]: {
        title: `Which fighter will win?`,
        description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
        outcomes: [NO_CONTEST_TIE, `${NAMING_TEAM.AWAY_TEAM}`, `${NAMING_TEAM.HOME_TEAM}`],
    },
    [MMA_MARKET_TYPE.OVER_UNDER]: {
        title: `Will there be over ${NAMING_LINE.OVER_UNDER_LINE}.5 total rounds scored?`,
        description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
        outcomes: [NO_CONTEST, `Over ${NAMING_LINE.OVER_UNDER_LINE}.5`, `Under ${NAMING_LINE.OVER_UNDER_LINE}.5`],
    },
}
