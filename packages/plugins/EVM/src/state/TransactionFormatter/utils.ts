import { FungibleToken, scale10, formatBalance } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export function getTokenAmountDescription(
    amount = '0',
    token?: FungibleToken<ChainId, SchemaType>,
    negative?: boolean,
) {
    const symbol = negative ? '- ' : ''
    const value = scale10(1, 9 + (token?.decimals ?? 18)).isGreaterThanOrEqualTo(amount)
        ? formatBalance(amount, token?.decimals ?? 0, 4)
        : 'infinite'
    return `${symbol}${value} ${token?.symbol?.trim()}`
}
