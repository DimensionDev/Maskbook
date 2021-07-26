import type { GoodGhostingInfo, Player, PlayerStandings, TimelineEvent } from './types'
import addSeconds from 'date-fns/addSeconds'
import differenceInDays from 'date-fns/differenceInDays'
import formatDuration from 'date-fns/formatDuration'
import isBefore from 'date-fns/isBefore'

export enum PlayerStatus {
    Winning = 'winning',
    Waiting = 'waiting',
    Ghost = 'ghost',
    Dropout = 'dropout',
    Unknown = 'unknown',
}

export function getPlayerStatus(info: GoodGhostingInfo, player?: Player): PlayerStatus {
    if (!player) return PlayerStatus.Unknown
    const mostRecentSegmentPaid = Number.parseInt(player.mostRecentSegmentPaid)

    if (mostRecentSegmentPaid === info.lastSegment - 1) return PlayerStatus.Winning
    if (player.withdrawn) return PlayerStatus.Dropout
    if (mostRecentSegmentPaid < info.currentSegment - 1) return PlayerStatus.Ghost
    if (mostRecentSegmentPaid === info.currentSegment - 1) return PlayerStatus.Waiting
    if (mostRecentSegmentPaid === info.currentSegment) return PlayerStatus.Winning
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

export function isEndOfTimeline(timelineIndex: number, timeline: TimelineEvent[]) {
    return timelineIndex === timeline.length - 1 && isBefore(timeline[timelineIndex].date, new Date())
}

export function getPlayerStandings(players: Player[], info: GoodGhostingInfo) {
    let playerStandings: PlayerStandings = {
        winning: 0,
        waiting: 0,
        ghosts: 0,
        dropouts: 0,
    }

    players.forEach((player, i) => {
        const playerStatus = getPlayerStatus(info, player)

        if (playerStatus === PlayerStatus.Dropout) playerStandings.dropouts += 1
        else if (playerStatus === PlayerStatus.Ghost) playerStandings.ghosts += 1
        else if (playerStatus === PlayerStatus.Waiting) playerStandings.waiting += 1
        else if (playerStatus === PlayerStatus.Winning) playerStandings.winning += 1
    })

    return playerStandings
}

export function getReadableInterval(roundLength: number) {
    const baseDate = new Date(0)
    const dateAfterDuration = addSeconds(baseDate, roundLength)
    const dayDifference = differenceInDays(dateAfterDuration, baseDate)
    const weeks = Math.floor(dayDifference / 7)
    const days = Math.floor(dayDifference - weeks * 7)
    return formatDuration({
        weeks,
        days,
    })
}
