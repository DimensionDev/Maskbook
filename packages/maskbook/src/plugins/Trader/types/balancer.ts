import type { SOR } from '@balancer-labs/sor'

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
    swaps: UnboxPromise<ReturnType<SOR['getSwaps']>>
    routes: Route[]
}
