import Web3 from 'web3'
import {
    createContract,
    createNativeToken,
    CurrencyType,
    formatBalance,
    formatEthereumAddress,
    getEthereumConstants,
    getTokenConstants,
    isSameAddress,
    PortfolioProvider,
    Web3ProviderType,
} from '@masknet/web3-shared-evm'
import type { Web3Plugin } from '@masknet/plugin-infra'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import type { AbiItem } from 'web3-utils'
import { uniqBy } from 'lodash-unified'
import { PLUGIN_NETWORKS } from '../../constants'
import { Pagination, TokenType } from '@masknet/plugin-infra'

const getTokenUSDValue = (token: Web3Plugin.Asset) =>
    token.value ? Number.parseFloat(token.value?.[CurrencyType.USD] ?? '') : 0
const getBalanceValue = (asset: Web3Plugin.Asset<Web3Plugin.FungibleToken>) =>
    parseFloat(formatBalance(asset.balance, asset.token.decimals))

const getTokenChainIdValue = (asset: Web3Plugin.Asset) => {
    const { NATIVE_TOKEN_ADDRESS } = getTokenConstants()
    return isSameAddress(asset.token.id, NATIVE_TOKEN_ADDRESS) ? 1 / asset.token.chainId : 0
}

const makeSortAssertWithoutChainFn = () => {
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

export const getFungibleAssetsFn =
    (context: Web3ProviderType) =>
    async (address: string, providerType: string, network: Web3Plugin.NetworkDescriptor, pagination?: Pagination) => {
        const chainId = context.chainId.getCurrentValue()
        const provider = context.provider.getCurrentValue()
        const networks = PLUGIN_NETWORKS
        const web3 = new Web3(provider)
        const trustedTokens = context.erc20Tokens.getCurrentValue()
        const { BALANCE_CHECKER_ADDRESS } = getEthereumConstants(chainId)
        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants()
        const dataFromProvider = await context.getAssetsList(address, PortfolioProvider.DEBANK)
        const assetsFromProvider: Web3Plugin.Asset<Web3Plugin.FungibleToken>[] = dataFromProvider.map((x) => ({
            id: x.token.address,
            chainId: x.token.chainId,
            balance: x.balance,
            price: x.price,
            value: x.value,
            logoURI: x.logoURI,
            token: {
                ...x.token,
                type: TokenType.Fungible,
                name: x.token.name!,
                symbol: x.token.symbol!,
                id: x.token.address,
                chainId: x.token.chainId,
            },
        }))

        if (!BALANCE_CHECKER_ADDRESS) return assetsFromProvider
        const balanceCheckerContract = createContract(web3, BALANCE_CHECKER_ADDRESS, BalanceCheckerABI as AbiItem[])
        if (!balanceCheckerContract) return assetsFromProvider
        const balanceList: string[] = await balanceCheckerContract?.methods
            .balances(
                [address],
                trustedTokens.map((x) => x.address),
            )
            .call({
                from: undefined,
            })
        if (balanceList.length !== trustedTokens?.length) return assetsFromProvider

        const assetFromChain = balanceList.map(
            (balance, idx): Web3Plugin.Asset<Web3Plugin.FungibleToken> => ({
                id: trustedTokens[idx].address,
                chainId: chainId,
                token: {
                    ...trustedTokens[idx],
                    id: trustedTokens[idx].address,
                    type: TokenType.Fungible,
                    name: trustedTokens[idx].name!,
                    symbol: trustedTokens[idx].symbol!,
                },
                balance,
            }),
        )

        const allTokens = [...assetsFromProvider, ...assetFromChain]

        const nativeTokens: Web3Plugin.Asset<Web3Plugin.FungibleToken>[] = networks
            .filter(
                (t) =>
                    t.isMainnet &&
                    !allTokens.find(
                        (x) => x.token.chainId === t.chainId && isSameAddress(x.token.id, NATIVE_TOKEN_ADDRESS),
                    ),
            )
            .map((x) => ({
                id: NATIVE_TOKEN_ADDRESS!,
                chainId: x.chainId,
                token: { ...createNativeToken(x.chainId), id: NATIVE_TOKEN_ADDRESS!, type: TokenType.Fungible },
                balance: '0',
            }))

        return uniqBy(
            [...nativeTokens, ...allTokens],
            (x) => `${x.token.chainId}_${formatEthereumAddress(x.token.id)}`,
        ).sort(makeSortAssertWithoutChainFn())
    }
