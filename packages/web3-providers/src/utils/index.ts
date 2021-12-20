import { ChainId, createERC20Token, createNativeToken, formatBalance } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'

export function getOrderUnitPrice(currentPrice?: string, decimals?: number, quantity?: string) {
    if (!currentPrice || !decimals || !quantity) return
    currentPrice = formatBalance(currentPrice, decimals)
    quantity = formatBalance(quantity, new BigNumber(quantity).toString() !== '1' ? 8 : 0)
    return new BigNumber(currentPrice).dividedBy(quantity).decimalPlaces(4, 1)
}

export function getOrderUSDPrice(currentPrice?: string, usdPrice?: string, decimals?: number) {
    if (!currentPrice || !decimals) return
    const price = formatBalance(usdPrice, 0)
    const quantity = formatBalance(currentPrice, decimals)
    return new BigNumber(price).multipliedBy(quantity).decimalPlaces(2, 1)
}

export function getLastSalePrice(total_price?: string, decimals?: number) {
    if (!total_price || !decimals) return
    return formatBalance(total_price, decimals)
}

interface Token {
    address: string
    decimals: number
    name: string
    symbol: string
}

export function toTokenDetailed(chainId: ChainId, token: Token) {
    if (token.symbol === 'ETH') return createNativeToken(chainId)
    return createERC20Token(chainId, token.address, token.decimals, token.name, token.symbol)
}
