import type { Swap } from '@balancer-labs/sor/dist/types.js'
import type { BigNumber } from 'bignumber.js'

export enum BALANCER_SWAP_TYPE {
    EXACT_IN = 'swapExactIn',
    EXACT_OUT = 'swapExactOut',
}

export interface Route {
    share: number
    hops: Hop[]
}

export interface Hop {
    pool: {
        address: string
        tokens: Asset[]
    }
    tokenIn: string
    tokenOut: string
    swapAmount: string
}

export interface Asset {
    address: string
    share: number
}

export type SwapResponse = {
    swaps: [Swap[][], BigNumber, BigNumber]
    routes: Route[]
}
