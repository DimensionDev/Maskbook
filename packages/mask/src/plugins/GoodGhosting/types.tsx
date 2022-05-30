import type BigNumber from 'bignumber.js'
import type { FungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType, TransactionStateType } from '@masknet/web3-shared-evm'

export interface GameMetaData {
    contractAddress: string
    gameName?: string
}

interface GoodGhostingBaseInfo {
    segmentPayment: string
    firstSegmentStart: number
    currentSegment: number
    lastSegment: number
    segmentLength: number
    numberOfPlayers: number
    maxPlayersCount: number
    totalGameInterest: string
    totalGamePrincipal: string
    adaiTokenAddress: string
    lendingPoolAddress: string
    earlyWithdrawalFee: string
    rewardsPerPlayer: string
    currentPlayer: Player | undefined
    gameHasEnded: boolean
    refresh: () => void
}

export interface GoodGhostingInfo extends GoodGhostingBaseInfo, GameMetaData {}

export interface Player {
    addr: string
    amountPaid: string
    canRejoin: boolean
    mostRecentSegmentPaid: string
    withdrawn: boolean
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
    incentives: string
    totalAdai: string
    reward: string
}

export interface GameFinancialData {
    poolAPY: BigNumber
    poolEarnings: BigNumber
    extraRewards: BigNumber
}

export interface GameAssets {
    gameAsset: FungibleAsset<ChainId, SchemaType>
    rewardAsset: FungibleAsset<ChainId, SchemaType>
}

export interface GameActionError {
    gameActionStatus: TransactionStateType
    transactionHash: string
}
