//#region dhedge
export interface DHedgePool {
    name: string
    managerName: string
    managerAddress: string
    poolDetails: string
    riskFactor: number
    totalValue: string
}

export interface DHedgeFund {
    fund: DHedgePool
}

export enum Period {
    D1 = '1d',
    W1 = '1w',
    M1 = '1m',
    M3 = '3m',
    M6 = '6m',
}

export interface PoolHistory {
    performance: string
    timestamp: string
}

export interface PerformanceHistory {
    history: PoolHistory[]
}

//#endregion
