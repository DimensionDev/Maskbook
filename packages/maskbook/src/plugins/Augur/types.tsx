export interface Team {
    team_id: number
    name: string
    mascot: string
    abbreviation: string
    record?: string
    sportId: string
}

export interface TeamsInterface {
    [key: string]: Team
}

export interface Sport {
    sportId: string
    name: string
    categories: string[]
}

export interface SportsInterface {
    [key: string]: Sport
}

export interface Outcome {
    id: number
    name: string
    symbol: string
    isInvalid: boolean
    isWinner: boolean
    isFinalNumerator: boolean
    shareToken: string
}

export interface Market {
    address: string
    id: string
    link: string
    homeTeam: Team
    awayTeam: Team
    title: string
    description: string
    endDate: Date
    outcomes: Outcome[]
    sport: Sport
    sportsMarketType: SportMarketType
    shareTokens: string[]
    hasWinner: boolean
    winner?: string
    value0: string
}

export enum SportMarketType {
    HeadToHead,
    Spread,
    OverUnder,
}

export interface SportTitles {
    title: string
    description: string
}
