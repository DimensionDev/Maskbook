//#region dhedge
export interface DHedgePool {
    name: string
    managerName: string
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
}

export interface PoolHistory {
    performance: string
    timestamp: string
}

export interface PerformanceHistory {
    history: PoolHistory[]
}

//#endregion
