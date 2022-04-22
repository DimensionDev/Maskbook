import type { Web3Plugin } from "@masknet/plugin-infra/web3"
import { scale10 } from "@masknet/web3-shared-base"
import { formatBalance } from "@masknet/web3-shared-evm"

export function getTokenAmountDescription(amount = '0', tokenDetailed?: Web3Plugin.FungibleToken, negative?: boolean) {
    const symbol = negative ? '- ' : ''
    const value = scale10(1, 9 + (tokenDetailed?.decimals ?? 18)).isGreaterThanOrEqualTo(amount)
        ? formatBalance(amount, tokenDetailed?.decimals ?? 0, 4)
        : 'infinite'
    const token = tokenDetailed?.symbol?.trim()
    return `${symbol}${value} ${token}`
}
