import { memoize } from 'lodash-es'
import { Token } from '@uniswap/sdk-core'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type ChainId, formatEthereumAddress, WNATIVE } from '@masknet/web3-shared-evm'
import { toUniswapChainId } from './toUniswapChainId.js'

export function toUniswapToken(chainId: ChainId, token: Web3Helper.FungibleTokenAll) {
    return new Token(
        toUniswapChainId(chainId),
        formatEthereumAddress(token.address),
        token.decimals,
        token.symbol,
        token.name,
    )
}

export const toUniswapTokenMemo: (chainID: ChainId) => Token = memoize((chainId: ChainId) =>
    toUniswapToken(chainId, WNATIVE[chainId]),
)
