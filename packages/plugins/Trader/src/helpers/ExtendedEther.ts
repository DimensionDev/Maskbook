import { Ether, type Token } from '@uniswap/sdk-core'
import { WNATIVE } from '@masknet/web3-shared-evm'
import { toUniswapTokenMemo } from './toUniswapToken.js'

export class ExtendedEther extends Ether {
    public override get wrapped(): Token {
        if (this.chainId in WNATIVE) return toUniswapTokenMemo(this.chainId)
        throw new Error('Unsupported chain ID')
    }

    private static _cachedEther: Record<number, ExtendedEther> = {}

    public static override onChain(chainId: number): ExtendedEther {
        return this._cachedEther[chainId] ?? (this._cachedEther[chainId] = new ExtendedEther(chainId))
    }
}
