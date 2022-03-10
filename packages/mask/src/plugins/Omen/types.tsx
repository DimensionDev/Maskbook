import type BigNumber from 'bignumber.js'

// Answer
interface Answer {
    id: string
    answer: ArrayBuffer | string
    bondAggregate: BigNumber
    question: Question
}

// Question
interface Question {
    id: string
    data: string
    title: string
    outcomes: string[]
    category: string
    language: string
    openingTimestamp: string
    timeout: BigNumber
    currentAnswer: ArrayBuffer | string
    currentAnswerBond: BigNumber
    currentAnswerTimestamp: string
    answerFinalizedTimestamp: string
    indexedFixedProductMarketMakers: []
    answers: Answer[]
}

// User
export interface User {
    id: string
}

// Token
export interface Token {
    id: string
    address: ArrayBuffer | string
    decimals: number
    name: string
    symbol: string
}

// fpmmTransaction
export interface fpmmTransaction {
    id: string
    user: User
    creationTimestamp: Date | string | number
    transactionType: string
    collateralTokenAmount: BigNumber
    sharesOrPoolTokenAmount: BigNumber
    transactionHash: ArrayBuffer | string
    additionalSharesCost: BigNumber
}

// fpmmLiquidity
export interface fpmmLiquidity {
    id: string
    type: string
    outcomeTokenAmounts: BigNumber[]
    collateralTokenAmount: BigNumber
    additionalLiquidityParameter: BigNumber
    funder: string
    sharesAmount: BigNumber
    collateralRemovedFromFeePool: BigNumber
    creationTimestamp: Date | string | number
    transactionHash: ArrayBuffer | string
    additionalSharesCost: BigNumber
}

// fixedProductMarketMaker
export interface fixedProductMarketMaker {
    id: string
    creator: ArrayBuffer | string
    creationTimestamp: BigNumber
    collateralToken: string
    fee: BigNumber
    collateralVolume: BigNumber
    usdVolume: BigNumber
    outcomeTokenAmounts: BigNumber[]
    outcomeTokenMarginalPrices: BigNumber[]
    lastActiveDay: BigNumber
    runningDailyVolume: BigNumber
    scaledRunningDailyVolume: BigNumber
    usdRunningDailyVolume: number
    runningDailyVolumeByHour: BigNumber[]
    usdRunningDailyVolumeByHour: BigNumber[]
    question: Question
    data: string
    title: string
    outcomes: string[]
    category: string
    language: string
    openingTimestamp: string
    timeout: BigNumber
    resolutionTimestamp: string
    payouts: BigNumber[]
    currentAnswer: ArrayBuffer | string
    currentAnswerBond: BigNumber
    currentAnswerTimestamp: string
    answerFinalizedTimestamp: string
}

// fixedProductMarketMaker graph result container
export interface fpmmData {
    fixedProductMarketMaker: fixedProductMarketMaker
}

// fpmmTransaction[] graph result container
export interface fpmmTransactionsData {
    fpmmTransactions: fpmmTransaction[]
}

// fpmmLiquidity graph result container
export interface fpmmLiquidityData {
    fpmmLiquidities: fpmmLiquidity[]
}

// fpmmLiquidity graph result container
export interface tokenData {
    registeredToken: Token
}

export type Stat = [number, number]
