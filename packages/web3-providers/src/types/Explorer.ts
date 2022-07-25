import type { Transaction as Web3Transaction } from 'web3-core'

export namespace ExplorerAPI {
    export type Transaction = Web3Transaction & {
        status: '0' | '1'
        confirmations: number
    }

    export interface PageInfo {
        offset?: number
        apikey?: string
    }

    export interface Provider {
        getLatestTransactions(account: string, url: string, pageInfo?: PageInfo): Promise<Transaction[]>
    }

    export interface TokenInfo {
        contractAddress: string
        tokenName: string
        symbol: string
        divisor: string
        tokenType: string
        totalSupply: string
        blueCheckmark: string
        description: string
        website: string
        email: string
        blog: string
        reddit: string
        slack: string
        facebook: string
        twitter: string
        bitcointalk: string
        github: string
        telegram: string
        wechat: string
        linkedin: string
        discord: string
        whitepaper: string
        tokenPriceUSD: string
    }
}
