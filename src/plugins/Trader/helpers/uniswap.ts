import { ChainId, Token } from '../../../web3/types'
import {
    Token as UniswapToken,
    ChainId as UniswapChainId,
    CurrencyAmount,
    JSBI,
    TokenAmount,
    Percent,
} from '@uniswap/sdk'
import { getConstant } from '../../../web3/constants'
import { WETH } from '../constants'
import { unreachable } from '../../../utils/utils'

export function toUniswapChainId(chainId: ChainId): UniswapChainId {
    switch (chainId) {
        case ChainId.Mainnet:
            return UniswapChainId.MAINNET
        case ChainId.Ropsten:
            return UniswapChainId.ROPSTEN
        case ChainId.Rinkeby:
            return UniswapChainId.RINKEBY
        case ChainId.Kovan:
            return UniswapChainId.KOVAN
        default:
            unreachable(chainId)
    }
}

export function toUniswapPercent(numerator: number, denominator: number) {
    return new Percent(JSBI.BigInt(numerator), JSBI.BigInt(denominator))
}

export function toUniswapToken(chainId: ChainId, token: Token): UniswapToken {
    if (token.address === getConstant('ETH_ADDRESS')) return toUniswapToken(chainId, WETH[chainId])
    return new UniswapToken(toUniswapChainId(chainId), token.address, token.decimals, token.symbol, token.name)
}

export function toUniswapCurrencyAmount(chainId: ChainId, token: Token, amount: string) {
    return token.address === getConstant('ETH_ADDRESS')
        ? CurrencyAmount.ether(JSBI.BigInt(amount))
        : new TokenAmount(toUniswapToken(chainId, token), JSBI.BigInt(amount))
}
