import { getConstant } from '../../../web3/constants'
import { ChainId, Token, EthereumTokenType } from '../../../web3/types'

// uniswap helpers
export * from './uniswap'

export function createEetherToken(chainId: ChainId) {
    return {
        type: EthereumTokenType.Ether,
        chainId,
        address: getConstant('ETH_ADDRESS'),
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    } as Token
}

export function createERC20Token(chainId: ChainId, address: string, decimals: number, name: string, symbol: string) {
    return {
        type: EthereumTokenType.ERC20,
        chainId,
        address,
        decimals,
        name,
        symbol,
    } as Token
}

export function toSignificant(digits: number) {}
