export interface Ticket {
    address: string
    decimals: string
    derivedETH: string
    name: string
    numberOfHolders: string
    symbol: string
    totalSupply: string
    totalSupplyUnformatted: {
        hex: string
        type: string
    }
    totalValueUsd: string
    totalValueUsdScaled: {
        hex: string
        type: string
    }
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
        amountUnformatted: {
            hex: string
            type: string
        }
        canCompleteAward: boolean
        canStartAward: boolean
        cumulativePrizeNet: string
        currentPrizeId: string
        currentState: string
        erc20Awards: {
            totalValueUsd: string
            totalValueUsdScaled: {
                hex: string
                type: string
            }
        }
        estimatedRemainingBlocksToPrize: string
        estimatedRemainingBlocksToPrizeUnformatted: {
            hex: string
            type: string
        }
        externalErc20Awards: [
            {
                address: string
                amount: string
                amountUnformatted: {
                    hex: string
                    type: string
                }
                decimals: string
                derivedETH: string
                id: string
                name: string
                symbol: string
                totalValueUsd: string
                totalValueUsdScaled: {
                    hex: string
                    type: string
                }
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
                    amountUnformatted: {
                        hex: string
                        type: string
                    }
                    decimals: string
                    derivedETH: string
                    id: string
                    lootBoxAddress: string
                    name: string
                    symbol: string
                    totalValueUsd?: string
                    totalValueUsdScaled?: {
                        hex: string
                        type: string
                    }
                    usd: number
                },
            ]
            // erc721Tokens: Not enough data
            id: string
            totalValueUsd: string
            totalValueUsdScaled: {
                hex: string
                type: string
            }
        }
        prizePeriodRemainingSeconds: {
            hex: string
            type: string
        }
        prizePeriodSeconds: {
            hex: string
            type: string
        }
        prizePeriodStartedAt: {
            hex: string
            type: string
        }
        sablierStream: {
            totalValueUsd: {
                hex: string
                type: string
            }
            totalValueUsdScaled: {
                hex: string
                type: string
            }
        }
        totalExternalAwardsValueUsd: string
        totalExternalAwardsValueUsdScaled: {
            hex: string
            type: string
        }
        totalInternalAwardsUsd: string
        totalInternalAwardsUsdScaled: {
            hex: string
            type: string
        }
        totalValueGrandPrizeWinnerUsd: string
        totalValueGrandPrizeWinnerUsdScaled: {
            hex: string
            type: string
        }
        totalValuePerWinnerUsd: string
        totalValuePerWinnerUsdScaled: {
            hex: string
            type: string
        }
        totalValueUsd: string
        totalValueUsdScaled: {
            hex: string
            type: string
        }
        weeklyTotalValueUsd: string
        weeklyTotalValueUsdScaled: {
            hex: string
            type: string
        }
        yield: {
            amount: string
            amountUnformatted: {
                hex: string
                type: string
            }
            comp: {
                totalValueUsd: string
                totalValueUsdScaled: {
                    hex: string
                    type: string
                }
                unclaimedAmount: string
                unclaimedAmountUnformatted: {
                    hex: string
                    type: string
                }
            }
            totalValueUsd: string
            totalValueUsdScaled: {
                hex: string
                type: string
            }
        }
    }
    prizePool: {
        address: string
        totalSponsorshipValueLockedUsd: string
        totalSponsorshipValueLockedUsdScaled: {
            hex: string
            type: string
        }
        totalTicketValueLockedUsd: string
        totalTicketValueLockedUsdScaled: {
            hex: string
            type: string
        }
        totalValueLockedUsd: string
        totalValueLockedUsdScaled: {
            hex: string
            type: string
        }
        type: string
    }
    prizeStrategy: {
        address: string
    }
    reserve: {
        address: string
        amount: string
        amountUnformatted: {
            hex: string
            type: string
        }
        rate: string
        rateUnformatted: {
            hex: string
            type: string
        }
        registry: {
            address: string
        }
        totalValueUsd: string
        totalValueUsdScaled: {
            hex: string
            type: string
        }
    }
    symbol: string
    tokenListener: {
        address: string
        apr: number
        dripRatePerDay: string
        dripRatePerDayUnformatted: {
            hex: string
            type: string
        }
        dripRatePerSecond: string
        dripRatePerSecondUnformatted: {
            hex: string
            type: string
        }
        measure: string
    }
    tokens: {
        cToken?: {
            address: string
            derivedETH: string
            supplyRatePerBlock: {
                hex: string
                type: string
            }
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
            totalSupplyUnformatted: {
                hex: string
                type: string
            }
            totalValueUsd: string
            totalValueUsdScaled: {
                hex: string
                type: string
            }
            usd: number
        }
        ticket: Ticket
        tokenFaucetDripToken?: {
            address: string
            amount: string
            amountUnformatted: {
                hex: string
                type: string
            }
            decimals: number
            derivedETH: string
            name: string
            symbol: string
            totalValueUsd: string
            totalValueUsdScaled: {
                hex: string
                type: string
            }
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
