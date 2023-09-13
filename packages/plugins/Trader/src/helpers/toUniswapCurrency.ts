import type { Currency } from '@uniswap/sdk-core'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, WNATIVE, SchemaType } from '@masknet/web3-shared-evm'
import { toUniswapToken } from './toUniswapToken.js'
import { ExtendedEther } from './ExtendedEther.js'

export function toUniswapCurrency(chainId?: ChainId, token?: Web3Helper.FungibleTokenAll): Currency | undefined {
    try {
        if (!token || !chainId) return
        const extendedEther = ExtendedEther.onChain(chainId)
        const weth = toUniswapToken(chainId, WNATIVE[chainId])
        if (weth && isSameAddress(token.address, weth.address)) return weth
        return token.schema === SchemaType.Native ? extendedEther : toUniswapToken(chainId, token)
    } catch {
        return
    }
}
