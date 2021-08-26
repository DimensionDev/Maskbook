import type {
    GameActionError,
    GameAssets,
    GameFinancialData,
    GoodGhostingInfo,
    LendingPoolData,
    Player,
    PlayerStandings,
    TimelineEvent,
} from './types'
import addSeconds from 'date-fns/addSeconds'
import differenceInDays from 'date-fns/differenceInDays'
import formatDuration from 'date-fns/formatDuration'
import isBefore from 'date-fns/isBefore'
import { CurrencyType, TransactionStateType } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'

export enum PlayerStatus {
    Winning = 'winning',
    Waiting = 'waiting',
    Ghost = 'ghost',
    Dropout = 'dropout',
    Unknown = 'unknown',
}

export function getPlayerStatus(info: GoodGhostingInfo, player?: Player): PlayerStatus {
    if (!player) return PlayerStatus.Unknown
    const mostRecentSegmentPaid = Number.parseInt(player.mostRecentSegmentPaid, 10)

    if (mostRecentSegmentPaid === info.lastSegment - 1) return PlayerStatus.Winning
    if (player.withdrawn) return PlayerStatus.Dropout
    if (mostRecentSegmentPaid < info.currentSegment - 1) return PlayerStatus.Ghost
    if (mostRecentSegmentPaid === info.currentSegment - 1) return PlayerStatus.Waiting
    if (mostRecentSegmentPaid === info.currentSegment) return PlayerStatus.Winning
    return PlayerStatus.Unknown
}

export function getNextTimelineIndex(timeline: TimelineEvent[]) {
    const now = new Date()
    for (let i = 0; i < timeline.length; i += 1) {
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
    const playerStandings: PlayerStandings = {
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

export function isGameActionError(error: unknown): error is GameActionError {
    return (
        Object.values(TransactionStateType).includes((error as GameActionError).gameActionStatus) &&
        (error as GameActionError).transactionHash !== undefined
    )
}

export function getGameFinancialData(
    info: GoodGhostingInfo,
    poolData: LendingPoolData,
    playerStandings: PlayerStandings,
    assets: GameAssets,
) {
    const rawPoolInterest = new BigNumber(poolData.totalAdai).isZero()
        ? new BigNumber(0)
        : new BigNumber(poolData.totalAdai).minus(info.totalGamePrincipal)
    const gameInterest = new BigNumber(info.gameHasEnded ? info.totalGameInterest : rawPoolInterest).multipliedBy(
        assets.gameAsset.price ? assets.gameAsset.price[CurrencyType.USD] : 1,
    )

    const gameRewards = new BigNumber(poolData.reward)
        .plus(
            info.gameHasEnded
                ? new BigNumber(playerStandings.winning).multipliedBy(info.rewardsPerPlayer)
                : poolData.incentives,
        )
        .multipliedBy(assets.rewardAsset.price ? assets.rewardAsset.price[CurrencyType.USD] : 0)

    const totalEarnings = gameInterest.plus(gameRewards)
    const winnerGains = totalEarnings.div(playerStandings.winning || 1)

    const baseDate = new Date(0)
    const dateAfterDuration = addSeconds(baseDate, info.segmentLength * (info.lastSegment + 1))
    const gameDuration = differenceInDays(dateAfterDuration, baseDate)

    const expectedPayment = new BigNumber(info.segmentPayment).multipliedBy(info.lastSegment)
    const dividend = winnerGains.multipliedBy(365)
    const divisor = expectedPayment
        .multipliedBy(gameDuration)
        .multipliedBy(assets.gameAsset.price ? assets.gameAsset.price[CurrencyType.USD] : 1)

    const poolAPY = dividend.dividedBy(divisor).multipliedBy(100)

    return {
        poolAPY,
        poolEarnings: info.gameHasEnded ? new BigNumber(info.totalGameInterest) : rawPoolInterest,
        extraRewards: info.gameHasEnded
            ? new BigNumber(playerStandings.winning).multipliedBy(info.rewardsPerPlayer)
            : new BigNumber(poolData.reward).plus(poolData.incentives),
    } as GameFinancialData
}
