// #region dhedge types

import type { ChainId } from '@masknet/web3-shared-evm'

export enum PoolType {
    v1 = 'V1.0',
    v2 = 'V2.0',
}

export enum BlockchainCode {
    ethereum = 'ETH',
    polygon = 'POLYGON',
}

export interface Pool {
    address: string
    name: string
    managerName: string
    managerAddress: string
    poolDetails: string
    riskFactor: number
    totalValue: string
    performance: string
    balanceOfManager: string
    totalSupply: string
    blockchainCode: BlockchainCode
    chainId: ChainId
    poolType: PoolType
    managerLogicAddress: string
}

export interface Fund {
    fund: Pool
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

// #endregion dhedge types
