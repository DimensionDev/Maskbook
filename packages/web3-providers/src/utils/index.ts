import { ChainId, createERC20Token, createNativeToken, formatBalance } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'

export function getOrderUnitPrice(currentPrice?: string, decimals?: number, quantity?: string) {
    if (!currentPrice || !decimals || !quantity) return
    const price = formatBalance(currentPrice, decimals)
    const _quantity = formatBalance(quantity, new BigNumber(quantity).toString() !== '1' ? 8 : 0)
    return new BigNumber(price).dividedBy(_quantity).toFixed(4, 1).toString()
}

export function getOrderUSDPrice(currentPrice?: string, usdPrice?: string, decimals?: number) {
    if (!currentPrice || !decimals) return
    const price = formatBalance(usdPrice, 0)
    const quantity = formatBalance(currentPrice, decimals)

    return new BigNumber(price).multipliedBy(quantity).toFixed(2, 1).toString()
}

export function getLastSalePrice(total_price?: string, decimals?: number) {
    if (!total_price || !decimals) return
    const price = formatBalance(total_price, decimals)
    return price
}

export function toTokenDetailed(
    chainId: ChainId,
    token: { address: string; decimals: number; name: string; symbol: string },
) {
    if (token.symbol === 'ETH') return createNativeToken(chainId)
    return createERC20Token(chainId, token.address, token.decimals, token.name, token.symbol)
}
