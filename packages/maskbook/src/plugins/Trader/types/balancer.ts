import type { SOR } from '@balancer-labs/sor'

export type SwapResponse = UnboxPromise<ReturnType<SOR['getSwaps']>>
