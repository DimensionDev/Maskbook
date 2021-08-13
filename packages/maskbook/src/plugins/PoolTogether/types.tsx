// Generated by https://quicktype.io

export interface Pool {
    address?: string
    config: Config
    prizePool: WelcomePrizePool
    prizeStrategy: PrizeStrategy
    tokens: Tokens
    prize: Prize
    reserve: Reserve
    tokenFaucets: TokenFaucet[]
    name: string
    contract: Contract
    symbol: string
    isCommunityPool?: boolean
}

export interface Config {
    liquidityCap: string
    maxExitFeeMantissa: string
    maxTimelockDurationSeconds: string
    timelockTotalSupply: string
    numberOfWinners: string
    prizePeriodSeconds: string
    tokenCreditRates: TokenCreditRate[]
    splitExternalErc20Awards: boolean
}

export interface TokenCreditRate {
    creditLimitMantissa: string
    creditRateMantissa: string
    id: string
}

export interface Contract {
    prizePool: PrizePool
    symbol: string
    subgraphVersion: string
    tokenFaucets?: ContractTokenFaucet[]
}

export interface PrizePool {
    address: string
}

export interface ContractTokenFaucet {
    address: string
    dripRatePerSecondUnformatted: AmountUnformatted
    measure: string
    string: string
    dripRatePerSecond: string
    dripRatePerDayUnformatted: AmountUnformatted
    dripRatePerDay: string
    dripToken: DripToken
}

export interface AmountUnformatted {
    type: Type
    hex: string
}

export enum Type {
    BigNumber = 'BigNumber',
}

export interface DripToken {
    tokenFaucetAddress: string
    address: string
    amount: string
    amountUnformatted: AmountUnformatted
    decimals: number
    name: string
    symbol: string
}

export interface Prize {
    cumulativePrizeNet: string
    currentPrizeId: string
    currentState: string
    externalErc20Awards: ExternalErc20Award[]
    externalErc721Awards: any[]
    sablierStream: SablierStream
    amount: string
    amountUnformatted: AmountUnformatted
    isRngRequested: boolean
    isRngCompleted: boolean
    canStartAward: boolean
    canCompleteAward: boolean
    prizePeriodStartedAt: AmountUnformatted
    prizePeriodRemainingSeconds: AmountUnformatted
    prizePeriodSeconds: AmountUnformatted
    prizePeriodEndAt: string
    estimatedRemainingBlocksToPrize: string
    estimatedRemainingBlocksToPrizeUnformatted: AmountUnformatted
    yield?: Yield
    lootBox: LootBox
    erc20Awards: Erc20Awards
    totalExternalAwardsValueUsdScaled: AmountUnformatted
    totalExternalAwardsValueUsd: string
    totalInternalAwardsUsdScaled: AmountUnformatted
    totalInternalAwardsUsd: string
    totalValueUsdScaled: AmountUnformatted
    totalValueUsd: string
    totalValuePerWinnerUsdScaled: AmountUnformatted
    totalValuePerWinnerUsd: string
    totalValueGrandPrizeWinnerUsdScaled: AmountUnformatted
    totalValueGrandPrizeWinnerUsd: string
    weeklyTotalValueUsd: string
    weeklyTotalValueUsdScaled: AmountUnformatted
    stake?: Stake
}

export interface Erc20Awards {
    totalValueUsdScaled: AmountUnformatted
    totalValueUsd: string
}

export interface ExternalErc20Award {
    address: string
    decimals: string
    id: string
    name: string
    symbol: string
    amount: string
    amountUnformatted: AmountUnformatted
    usd: number
    derivedETH: string
    totalValueUsd: string
    totalValueUsdScaled: AmountUnformatted
}

export interface LootBox {
    address?: string
    id: null | string
    erc1155Tokens?: any[]
    erc721Tokens?: any[]
    erc20Tokens?: any[]
    totalValueUsdScaled: AmountUnformatted
    totalValueUsd: string
}

export interface SablierStream {
    totalValueUsd: AmountUnformatted | string
    totalValueUsdScaled: AmountUnformatted
    id?: string
    deposit?: AmountUnformatted
    ratePerSecond?: AmountUnformatted
    remainingBalance?: AmountUnformatted
    startTime?: AmountUnformatted
    stopTime?: AmountUnformatted
    amountUnformatted?: AmountUnformatted
    amount?: string
    amountThisPrizePeriodUnformatted?: AmountUnformatted
    amountThisPrizePeriod?: string
    amountPerPrizePeriodUnformatted?: AmountUnformatted
    amountPerPrizePeriod?: string
}

export interface Stake {
    amountUnformatted: AmountUnformatted
    amount: string
    totalValueUsd: string
    totalValueUsdScaled: AmountUnformatted
}

export interface Yield {
    comp?: YieldComp
    amountUnformatted: AmountUnformatted
    amount: string
    totalValueUsd: string
    totalValueUsdScaled: AmountUnformatted
    estimatedPrize?: Stake
}

export interface YieldComp {
    unclaimedAmountUnformatted: AmountUnformatted
    unclaimedAmount: string
    totalValueUsd: string
    totalValueUsdScaled: AmountUnformatted
}

export interface WelcomePrizePool {
    address: string
    type: string
    totalValueLockedUsd: string
    totalValueLockedUsdScaled: AmountUnformatted
    totalTicketValueLockedUsd: string
    totalTicketValueLockedUsdScaled: AmountUnformatted
    totalSponsorshipValueLockedUsd: string
    totalSponsorshipValueLockedUsdScaled: AmountUnformatted
    yieldSource?: YieldSource
}

export interface YieldSource {
    address: string
    type: string
    apy: number | string
    sushi?: Sushi
    aave?: Aave
}

export interface Aave {
    additionalApy: string
}

export interface Sushi {
    additionalApy: number
}

export interface PrizeStrategy {
    address: string
    tokenListener: null | string
}

export interface Reserve {
    registry: PrizePool
    amountUnformatted: AmountUnformatted
    amount: string
    address: string
    rate: string
    rateUnformatted: AmountUnformatted
    totalValueUsd: string
    totalValueUsdScaled: AmountUnformatted
}

export interface TokenFaucet {
    address: string
    dripRatePerSecondUnformatted: AmountUnformatted
    measure: string
    string: string
    dripRatePerSecond: string
    dripRatePerDayUnformatted: AmountUnformatted
    dripRatePerDay: string
    dripToken: DripTokenElement
    apr: number
}

export interface DripTokenElement {
    tokenFaucetAddress: string
    address: string
    amount: string
    amountUnformatted: AmountUnformatted
    decimals: number
    name: string
    symbol: string
    usd: number
    derivedETH: string
    totalValueUsd?: string
    totalValueUsdScaled?: AmountUnformatted
}

export interface Tokens {
    ticket: Sponsorship
    sponsorship: Sponsorship
    underlyingToken: UnderlyingToken
    cToken?: CToken
    tokenFaucetDripTokens?: DripTokenElement[]
    comp?: PoolClass
    pool?: PoolClass
    sablierStreamToken?: PoolClass
}

export interface CToken {
    address: string
    supplyRatePerBlock: AmountUnformatted
    usd: number
    derivedETH: string
}

export interface PoolClass {
    address: string
    decimals: number
    name: string
    symbol: string
    usd: number
    derivedETH: string
}

export interface Sponsorship {
    address: string
    decimals: string
    name: string
    symbol: string
    totalSupply: string
    totalSupplyUnformatted: AmountUnformatted
    numberOfHolders: string
    usd: number
    derivedETH: string
    totalValueUsd: string
    totalValueUsdScaled: AmountUnformatted
}

export interface UnderlyingToken {
    address: string
    decimals: string
    name: string
    symbol: string
    usd: number
    derivedETH: string
}

export interface AccountBalance {
    ticketBalance: string
    userAddress: string
}

export interface AccountPool {
    pool: Pool
    account: AccountBalance
}
