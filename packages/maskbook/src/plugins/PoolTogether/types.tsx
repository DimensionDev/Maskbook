export interface RawNumber {
    hex: string
    type: string
}

export interface Ticket {
    address: string
    decimals: string
    derivedETH: string
    name: string
    numberOfHolders: string
    symbol: string
    totalSupply: string
    totalSupplyUnformatted: RawNumber
    totalValueUsd: string
    totalValueUsdScaled: RawNumber
    usd: number
}

export interface Pool {
    config: {
        liquidityCap: string
        maxExitFeeMantissa: string
        maxTimelockDurationSeconds: string
        timelockTotalSupply: string
        numberOfWinners: string
        prizePeriodSeconds: string
        tokenCreditRates: {
            id: string
            creditLimitMantissa: string
            creditRateMantissa: string
        }
        splitExternalErc20Awards: boolean
    }
    contract: {
        prizePool: {
            address: string
        }
        subgraphVersion: string
        symbol: string
        isCommunityPool?: boolean
    }
    name: string
    prize: {
        amount: string
        amountUnformatted: RawNumber
        canCompleteAward: boolean
        canStartAward: boolean
        cumulativePrizeNet: string
        currentPrizeId: string
        currentState: string
        erc20Awards: {
            totalValueUsd: string
            totalValueUsdScaled: RawNumber
        }
        estimatedRemainingBlocksToPrize: string
        estimatedRemainingBlocksToPrizeUnformatted: RawNumber
        externalErc20Awards: [
            {
                address: string
                amount: string
                amountUnformatted: RawNumber
                decimals: string
                derivedETH: string
                id: string
                name: string
                symbol: string
                totalValueUsd: string
                totalValueUsdScaled: RawNumber
                usd: number
            },
        ]
        // externalErc721Awards: Not enough data
        isRngCompleted: boolean
        isRngRequested: boolean
        lootBox: {
            address: string
            erc1155Tokens: []
            erc20Tokens: [
                {
                    address: string
                    amount: string
                    amountUnformatted: RawNumber
                    decimals: string
                    derivedETH: string
                    id: string
                    lootBoxAddress: string
                    name: string
                    symbol: string
                    totalValueUsd?: string
                    totalValueUsdScaled?: RawNumber
                    usd: number
                },
            ]
            // erc721Tokens: Not enough data
            id: string
            totalValueUsd: string
            totalValueUsdScaled: RawNumber
        }
        prizePeriodRemainingSeconds: RawNumber
        prizePeriodSeconds: RawNumber
        prizePeriodStartedAt: RawNumber
        sablierStream: {
            totalValueUsd: RawNumber
            totalValueUsdScaled: RawNumber
        }
        totalExternalAwardsValueUsd: string
        totalExternalAwardsValueUsdScaled: RawNumber
        totalInternalAwardsUsd: string
        totalInternalAwardsUsdScaled: RawNumber
        totalValueGrandPrizeWinnerUsd: string
        totalValueGrandPrizeWinnerUsdScaled: RawNumber
        totalValuePerWinnerUsd: string
        totalValuePerWinnerUsdScaled: RawNumber
        totalValueUsd: string
        totalValueUsdScaled: RawNumber
        weeklyTotalValueUsd: string
        weeklyTotalValueUsdScaled: RawNumber
        yield: {
            amount: string
            amountUnformatted: RawNumber
            comp: {
                totalValueUsd: string
                totalValueUsdScaled: RawNumber
                unclaimedAmount: string
                unclaimedAmountUnformatted: RawNumber
            }
            totalValueUsd: string
            totalValueUsdScaled: RawNumber
        }
    }
    prizePool: {
        address: string
        totalSponsorshipValueLockedUsd: string
        totalSponsorshipValueLockedUsdScaled: RawNumber
        totalTicketValueLockedUsd: string
        totalTicketValueLockedUsdScaled: RawNumber
        totalValueLockedUsd: string
        totalValueLockedUsdScaled: RawNumber
        type: string
    }
    prizeStrategy: {
        address: string
    }
    reserve: {
        address: string
        amount: string
        amountUnformatted: RawNumber
        rate: string
        rateUnformatted: RawNumber
        registry: {
            address: string
        }
        totalValueUsd: string
        totalValueUsdScaled: RawNumber
    }
    symbol: string
    tokenListener: {
        address: string
        apr: number
        dripRatePerDay: string
        dripRatePerDayUnformatted: RawNumber
        dripRatePerSecond: string
        dripRatePerSecondUnformatted: RawNumber
        measure: string
    }
    tokens: {
        cToken?: {
            address: string
            derivedETH: string
            supplyRatePerBlock: RawNumber
            usd: number
        }
        comp?: {
            address: string
            decimals: number
            derivedETH: string
            name: string
            symbol: string
            usd: number
        }
        sponsorship: {
            address: string
            decimals: string
            derivedETH: string
            name: string
            numberOfHolders: string
            symbol: string
            totalSupply: string
            totalSupplyUnformatted: RawNumber
            totalValueUsd: string
            totalValueUsdScaled: RawNumber
            usd: number
        }
        ticket: Ticket
        tokenFaucetDripToken?: {
            address: string
            amount: string
            amountUnformatted: RawNumber
            decimals: number
            derivedETH: string
            name: string
            symbol: string
            totalValueUsd: string
            totalValueUsdScaled: RawNumber
            usd: number
        }
        underlyingToken: {
            address: string
            decimals: string
            derivedETH: string
            name: string
            symbol: string
            usd: number
        }
    }
}

export interface AccountBalance {
    ticketBalance: string
    userAddress: string
}

export interface AccountPool {
    pool: Pool
    account: AccountBalance
}
