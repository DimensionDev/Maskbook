export interface GoodGhostingInfo {
    segmentPayment: string
    firstSegmentStart: number
    currentSegment: number
    lastSegment: number
    segmentLength: number
    gameLengthFormatted: string
    segmentLengthFormatted: string
    numberOfPlayers: number
    totalGameInterest: string
    totalGamePrincipal: string
    timeline: TimelineEvent[]
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
