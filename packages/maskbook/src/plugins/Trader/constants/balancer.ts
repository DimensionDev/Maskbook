import BigNumber from 'bignumber.js'

// gasPrice is used by SOR as a factor to determine how many pools to swap against.
// i.e. higher cost means more costly to trade against lots of different pools.
// Can be changed in future using SOR.gasPrice = newPrice
export const BALANCER_SOR_GAS_PRICE = new BigNumber('25000000000')

// This determines the max no of pools the SOR will use to swap.
export const BALANCER_MAX_NO_POOLS = 4

export const BALANCER_SWAP_EXACT_IN = 'swapExactIn'
export const BALANCER_SWAP_EXACT_OUT = 'swapExactOut'
