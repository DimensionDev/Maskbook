import type { Token } from '@uniswap/sdk-core'

export interface rawTokenMap {
    [chainId: number]: {
        [poolId: string]: {
            decimal: number
            principalToken: string
            shortToken: string
            longToken: string
            sponsorToken: string
        }
    }
}

export type TokenMap = {
    [chainId: number]: {
        [poolId: string]: {
            [tokenType: string]: Token
        }
    }
}
