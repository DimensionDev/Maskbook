export interface AaveReserveData {
    availableLiquidity: string
    totalStableDebt: string
    totalVariableDebt: string
    liquidityRate: string
    variableBorrowRate: string
    stableBorrowRate: string
    averageStableBorrowRate: string
    liquidityIndex: string
    variableBorrowIndex: string
    lastUpdateTimestamp: string
}

export interface AaveAssetDetails {
    name?: string
    address?: string
    decimals?: number
    currentBalance?: any
    variableBorrowRate?: any
    stableBorrowRate?: any
    totalStableDebt?: any
    totalVariableDebt?: any

    availableLiquidity?: string

    liquidityRate?: any

    averageStableBorrowRate?: string
    liquidityIndex?: string
    variableBorrowIndex?: string
    lastUpdateTimestamp?: string
}

export interface AavePoolReserveConfigData {
    decimals: string
    ltv: string
    liquidationThreshold: string
    liquidationBonus: string
    reserveFactor: string
    usageAsCollateralEnabled: boolean
    borrowingEnabled: boolean
    stableBorrowRateEnabled: boolean
    isActive: boolean
    isFrozen: boolean
}

export interface AaveAssetReserve {
    aTokenAddress: string
    stableDebtTokenAddress: string
    variableDebtTokenAddress: string
    interestRateStrategyAddress: string
}
