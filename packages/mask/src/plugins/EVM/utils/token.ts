import type { Web3Plugin } from '@masknet/plugin-infra'
import { CurrencyType, formatBalance, getTokenConstants, isSameAddress } from '@masknet/web3-shared-evm'

// TODO: remove
export const getTokenUSDValue = (token: Web3Plugin.Asset) =>
    token.value ? Number.parseFloat(token.value?.[CurrencyType.USD] ?? '') : 0

export const getBalanceValue = (asset: Web3Plugin.Asset<Web3Plugin.FungibleToken>) =>
    Number.parseFloat(formatBalance(asset.balance, asset.token.decimals))

export const getTokenChainIdValue = (asset: Web3Plugin.Asset) => {
    const { NATIVE_TOKEN_ADDRESS } = getTokenConstants()
    return isSameAddress(asset.token.id, NATIVE_TOKEN_ADDRESS) ? 1 / asset.token.chainId : 0
}

export const makeSortAssertWithoutChainFn = () => {
    return (a: Web3Plugin.Asset<Web3Plugin.FungibleToken>, b: Web3Plugin.Asset<Web3Plugin.FungibleToken>) => {
        // Token with high usd value estimation has priority
        const valueDifference = getTokenUSDValue(b) - getTokenUSDValue(a)
        if (valueDifference !== 0) return valueDifference

        // native token sort
        const chainValueDifference = getTokenChainIdValue(b) - getTokenChainIdValue(a)
        if (chainValueDifference !== 0) return chainValueDifference

        // Token with big balance has priority
        if (getBalanceValue(a) > getBalanceValue(b)) return -1
        if (getBalanceValue(a) < getBalanceValue(b)) return 1

        // Sorted by alphabet
        if ((a.token.name ?? '') > (b.token.name ?? '')) return 1
        if ((a.token.name ?? '') < (b.token.name ?? '')) return -1

        return 0
    }
}
