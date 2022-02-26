import { CurrencyType, Web3Plugin } from '@masknet/plugin-infra'
import { formatBalance, getTokenConstants, isSameAddress } from '@masknet/web3-shared-evm'

// TODO: remove
export const getTokenUSDValue = (token: Web3Plugin.FungibleAsset) =>
    token.value ? Number.parseFloat(token.value?.[CurrencyType.USD] ?? '0') : 0

export const getBalanceValue = (asset: Web3Plugin.FungibleAsset) =>
    Number.parseFloat(formatBalance(asset.balance, asset.decimals))

export const getTokenChainIdValue = (asset: Web3Plugin.FungibleAsset) => {
    const { NATIVE_TOKEN_ADDRESS } = getTokenConstants()
    return isSameAddress(asset.id, NATIVE_TOKEN_ADDRESS) ? 1 / asset.chainId : 0
}

export const makeSortAssetWithoutChainFn = () => {
    return (a: Web3Plugin.FungibleAsset, b: Web3Plugin.FungibleAsset) => {
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
        if ((a.name ?? '') > (b.name ?? '')) return 1
        if ((a.name ?? '') < (b.name ?? '')) return -1

        return 0
    }
}
