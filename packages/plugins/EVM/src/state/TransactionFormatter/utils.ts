import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { scale10 } from '@masknet/web3-shared-base'
import { ChainId, formatBalance, SchemaType } from '@masknet/web3-shared-evm'

export function getTokenAmountDescription(
    amount = '0',
    token?: Web3Plugin.FungibleToken<ChainId, SchemaType>,
    negative?: boolean,
) {
    const symbol = negative ? '- ' : ''
    const value = scale10(1, 9 + (token?.decimals ?? 18)).isGreaterThanOrEqualTo(amount)
        ? formatBalance(amount, token?.decimals ?? 0, 4)
        : 'infinite'
    return `${symbol}${value} ${token?.symbol?.trim()}`
}
