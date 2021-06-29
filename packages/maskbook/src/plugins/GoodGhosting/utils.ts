import type { Player } from './types'

export enum PlayerStatus {
    Winning = 'Winning',
    Waiting = 'Waiting',
    Ghost = 'Ghost',
    Dropout = 'Dropout',
    Unknown = 'Unknown',
}

export function getPlayerStatus(player: Player, currentSegment: number): PlayerStatus {
    const mostRecentSegmentPaid = Number.parseInt(player.mostRecentSegmentPaid)

    if (player.withdrawn) return PlayerStatus.Dropout
    else if (mostRecentSegmentPaid < currentSegment - 1) return PlayerStatus.Ghost
    else if (mostRecentSegmentPaid === currentSegment - 1) return PlayerStatus.Waiting
    else if (mostRecentSegmentPaid === currentSegment) return PlayerStatus.Winning
    else return PlayerStatus.Unknown
}
