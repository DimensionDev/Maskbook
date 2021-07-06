import { isBefore } from 'date-fns'
import type { Player, PlayerStandings, TimelineEvent } from './types'

export enum PlayerStatus {
    Winning = 'winning',
    Waiting = 'waiting',
    Ghost = 'ghost',
    Dropout = 'dropout',
    Unknown = 'unknown',
}

export function getPlayerStatus(currentSegment: number, player?: Player): PlayerStatus {
    if (!player) return PlayerStatus.Unknown
    const mostRecentSegmentPaid = Number.parseInt(player.mostRecentSegmentPaid)

    if (player.withdrawn) return PlayerStatus.Dropout
    if (mostRecentSegmentPaid < currentSegment - 1) return PlayerStatus.Ghost
    if (mostRecentSegmentPaid === currentSegment - 1) return PlayerStatus.Waiting
    if (mostRecentSegmentPaid === currentSegment) return PlayerStatus.Winning
    return PlayerStatus.Unknown
}

export function getNextTimelineIndex(timeline: TimelineEvent[]) {
    const now = new Date()
    for (let i = 0; i < timeline.length; i++) {
        if (isBefore(now, timeline[i].date)) {
            return i
        }
    }
    return timeline.length - 1
}

export function getPlayerStandings(players: Player[], currentSegment: number) {
    let playerStandings: PlayerStandings = {
        winning: 0,
        waiting: 0,
        ghosts: 0,
        dropouts: 0,
    }

    players.forEach((player, i) => {
        const playerStatus = getPlayerStatus(currentSegment, player)

        if (playerStatus === PlayerStatus.Dropout) playerStandings.dropouts += 1
        else if (playerStatus === PlayerStatus.Ghost) playerStandings.ghosts += 1
        else if (playerStatus === PlayerStatus.Waiting) playerStandings.waiting += 1
        else if (playerStatus === PlayerStatus.Winning) playerStandings.winning += 1
    })

    return playerStandings
}
