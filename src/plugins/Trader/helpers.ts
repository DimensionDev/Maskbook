import type { ChainId } from '../../web3/types'

export function createERC20(chainId: ChainId, address: string, decimals: number, name: string, symbol: string) {
    return {
        chainId,
        address,
        decimals,
        name,
        symbol,
    }
}
