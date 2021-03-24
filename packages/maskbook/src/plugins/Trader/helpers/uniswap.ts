import BigNumber from 'bignumber.js'
import {
    Token as UniswapToken,
    ChainId as UniswapChainId,
    Currency as UniswapCurrency,
    CurrencyAmount as UniswapCurrencyAmount,
    Percent as UniswapPercent,
    Price as UniswapPrice,
    JSBI,
    TokenAmount,
    ETHER,
} from '@uniswap/sdk'
import {
    Token as QuickswapToken,
    ChainId as QuickswapChainId,
    Currency as QuickswapCurrency,
    CurrencyAmount as QuickswapCurrencyAmount,
    Percent as QuickswapPercent,
    Price as QuickswapPrice,
    WETH as WMATIC,
} from 'quickswap-sdk'
import { WETH } from '../constants'
import {
    ChainId,
    ERC20TokenDetailed,
    EthereumTokenType,
    EtherTokenDetailed,
    MaticTokenDetailed,
} from '../../../web3/types'
import { unreachable } from '../../../utils/utils'
import { isETH, isWMATIC } from '../../../web3/helpers'
import { formatEthereumAddress } from '../../Wallet/formatter'

export function toUniswapChainId(chainId: ChainId): UniswapChainId | QuickswapChainId {
    switch (chainId) {
        case ChainId.Mainnet:
            return UniswapChainId.MAINNET
        case ChainId.Ropsten:
            return UniswapChainId.ROPSTEN
        case ChainId.Rinkeby:
            return UniswapChainId.RINKEBY
        case ChainId.Kovan:
            return UniswapChainId.KOVAN
        case ChainId.Gorli:
            return UniswapChainId.GÖRLI
        case ChainId.Matic:
            return QuickswapChainId.MATIC
        case ChainId.Mumbai:
            return QuickswapChainId.MUMBAI
        default:
            unreachable(chainId)
    }
}

export function toUniswapPercent(numerator: number, denominator: number) {
    return new UniswapPercent(JSBI.BigInt(numerator), JSBI.BigInt(denominator))
}

export function toUniswapCurrency(
    chainId: ChainId,
    token: EtherTokenDetailed | ERC20TokenDetailed,
): UniswapCurrency | QuickswapCurrency {
    if (isETH(token.address)) return ETHER
    if (isWMATIC(token.address)) return WMATIC
    return toUniswapToken(chainId, token)
}

export function toUniswapToken(
    chainId: ChainId,
    token: EtherTokenDetailed | MaticTokenDetailed | ERC20TokenDetailed,
): UniswapToken | QuickswapToken {
    if (isETH(token.address)) return toUniswapToken(chainId, WETH[chainId])
    return new UniswapToken(
        toUniswapChainId(chainId),
        formatEthereumAddress(token.address),
        token.decimals ?? 0,
        token.symbol,
        token.name,
    )
}

export function toUniswapCurrencyAmount(
    chainId: ChainId,
    token: EtherTokenDetailed | ERC20TokenDetailed,
    amount: string,
) {
    return isETH(token.address)
        ? UniswapCurrencyAmount.ether(JSBI.BigInt(amount))
        : new TokenAmount(toUniswapToken(chainId, token), JSBI.BigInt(amount))
}

export function uniswapChainIdTo(chainId: UniswapChainId | QuickswapChainId) {
    switch (chainId) {
        case UniswapChainId.MAINNET:
            return ChainId.Mainnet
        case UniswapChainId.ROPSTEN:
            return ChainId.Ropsten
        case UniswapChainId.RINKEBY:
            return ChainId.Rinkeby
        case UniswapChainId.KOVAN:
            return ChainId.Kovan
        case UniswapChainId.GÖRLI:
            return ChainId.Gorli
        case QuickswapChainId.MATIC:
            return ChainId.Matic
        case QuickswapChainId.MUMBAI:
            return ChainId.Mumbai
        default:
            unreachable(chainId)
    }
}

export function uniswapPercentTo(percent: UniswapPercent) {
    return new BigNumber(percent.numerator.toString()).dividedBy(new BigNumber(percent.denominator.toString()))
}

export function uniswapPriceTo(price: UniswapPrice) {
    return new BigNumber(price.scalar.numerator.toString()).dividedBy(price.scalar.denominator.toString())
}

export function uniswapTokenTo(token: UniswapToken) {
    return {
        type: token.name === 'ETH' ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        address: formatEthereumAddress(token.address),
        chainId: uniswapChainIdTo(token.chainId),
    } as EtherTokenDetailed | ERC20TokenDetailed
}

export function uniswapCurrencyAmountTo(currencyAmount: UniswapCurrencyAmount) {
    return new BigNumber(currencyAmount.raw.toString())
}
