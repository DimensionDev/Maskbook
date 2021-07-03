import type BigNumber from 'bignumber.js'

export interface GoodGhostingInfo {
    segmentPayment: string
    firstSegmentStart: number
    currentSegment: number
    lastSegment: number
    segmentLength: number
    numberOfPlayers: number
    totalGameInterest: string
    totalGamePrincipal: string
    adaiTokenAddress: string
    lendingPoolAddress: string
    currentPlayer: Player | undefined
}

export interface Player {
    addr: string
    amountPaid: string
    canRejoin: Boolean
    mostRecentSegmentPaid: string
    withdrawn: Boolean
}

export interface PlayerStandings {
    winning: number
    waiting: number
    ghosts: number
    dropouts: number
}

export interface TimelineEvent {
    date: Date
    eventOnDate: string
    ongoingEvent: string
}

export interface LendingPoolData {
    reward: string
    poolAPY: BigNumber
    poolEarnings: BigNumber
}
