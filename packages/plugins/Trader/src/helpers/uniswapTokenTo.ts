import type { Token } from '@uniswap/sdk-core'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TokenType } from '@masknet/web3-shared-base'
import { SchemaType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { uniswapChainIdTo } from './uniswapChainIdTo.js'

export function uniswapTokenTo(token: Token) {
    return {
        type: TokenType.Fungible,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        address: formatEthereumAddress(token.address),
        chainId: uniswapChainIdTo(token.chainId),
        schema: ['eth', 'matic', 'bnb'].includes(token.name?.toLowerCase() ?? '')
            ? SchemaType.Native
            : SchemaType.ERC20,
        id: token.symbol,
    } as Web3Helper.FungibleTokenAll
}
