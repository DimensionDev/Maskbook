import { getRegisteredWeb3Networks, NetworkPluginID, Pagination, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import { TokenPrice } from '@masknet/web3-providers'
import {
    ChainId,
    createContract,
    createExternalProvider,
    createNativeToken,
    CurrencyType,
    formatEthereumAddress,
    FungibleAssetProvider,
    getCoinGeckoCoinId,
    getEthereumConstants,
    isSameAddress,
    PriceRecord,
    Web3ProviderType,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { uniqBy } from 'lodash-unified'
import Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { makeSortAssertWithoutChainFn } from '../../utils/token'
import { getProxyWebsocketInstance, pow10 } from '@masknet/web3-shared-base'
import { createGetLatestBalance } from './createGetLatestBalance'

// tokens unavailable neither from api or balance checker.
// https://forum.conflux.fun/t/how-to-upvote-debank-proposal-for-conflux-espace-integration/13935
const TokenUnavailableFromDebankList = [ChainId.Conflux]

export const getFungibleAssetsFn =
    (context: Web3ProviderType) =>
    async (address: string, providerType: string, network: Web3Plugin.NetworkDescriptor, pagination?: Pagination) => {
        const socket = await getProxyWebsocketInstance()
        const chainId = context.chainId.getCurrentValue()
        const wallet = context.wallets.getCurrentValue().find((x) => isSameAddress(x.address, address))
        const networks = getRegisteredWeb3Networks().filter(
            (x) => NetworkPluginID.PLUGIN_EVM === x.networkSupporterPluginID && x.isMainnet,
        )
        const supportedNetworkIds = networks.map((x) => x.chainId)
        const trustedTokens = uniqBy(
            context.erc20Tokens
                .getCurrentValue()
                .filter((x) => wallet?.erc20_token_whitelist.has(formatEthereumAddress(x.address))),
            (x) => `${x.chainId}_${formatEthereumAddress(x.address)}`,
        )

        const web3 = new Web3(
            createExternalProvider(context.request, context.getSendOverrides, context.getRequestOptions),
        )
        const { BALANCE_CHECKER_ADDRESS } = getEthereumConstants(chainId)
        const dataFromProvider = await context.getAssetsList(address, FungibleAssetProvider.DEBANK)
        const assetsFromProvider = dataFromProvider
            .map<Web3Plugin.Asset<Web3Plugin.FungibleToken>>((x) => ({
                id: x.token.address,
                chainId: x.token.chainId,
                balance: x.balance,
                price: x.price,
                value: x.value,
                logoURI: x.logoURI,
                token: {
                    ...x.token,
                    name: x.token.name ?? 'Unknown Token',
                    symbol: x.token.symbol ?? 'Unknown',
                    id: x.token.address,
                    chainId: x.token.chainId,
                    type: TokenType.Fungible,
                },
            }))
            .filter((x) => supportedNetworkIds.includes(x.chainId))

        const balanceCheckerContract = createContract(
            web3,
            BALANCE_CHECKER_ADDRESS ?? '',
            BalanceCheckerABI as AbiItem[],
        )

        let balanceList: string[] = []

        if (BALANCE_CHECKER_ADDRESS && balanceCheckerContract) {
            try {
                balanceList = await balanceCheckerContract?.methods
                    .balances(
                        [address],
                        trustedTokens.map((x) => x.address),
                    )
                    .call({
                        from: address,
                    })
                if (balanceList.length !== trustedTokens?.length) return assetsFromProvider
            } catch {
                balanceList = []
            }
        }

        const assetFromChain = balanceList.map(
            (balance, idx): Web3Plugin.Asset<Web3Plugin.FungibleToken> => ({
                id: trustedTokens[idx].address,
                chainId,
                token: {
                    ...trustedTokens[idx],
                    address: trustedTokens[idx].address,
                    type: TokenType.Fungible,
                    name: trustedTokens[idx].name ?? 'Unknown Token',
                    symbol: trustedTokens[idx].symbol ?? 'Unknown',
                },
                balance,
            }),
        )

        const allTokens = [...assetsFromProvider, ...assetFromChain]

        const getBalance = createGetLatestBalance(context)
        const allRequest = TokenUnavailableFromDebankList.map(async (x) => {
            const balance = await getBalance(x, address)
            const coinId = getCoinGeckoCoinId(x)
            const price = (await TokenPrice.getNativeTokenPrice([coinId], CurrencyType.USD))[coinId]

            return {
                chainId: x,
                price: price,
                balance,
            }
        })

        const tokenUnavailableFromDebankResults = (await Promise.allSettled(allRequest))
            .map((x) => (x.status === 'fulfilled' ? x.value : null))
            .filter((x) => Boolean(x)) as {
            chainId: ChainId
            balance: string
            price: PriceRecord
        }[]

        const nativeTokens: Web3Plugin.Asset<Web3Plugin.FungibleToken>[] = networks
            .filter(
                (t) =>
                    t.isMainnet &&
                    !allTokens.find(
                        (x) =>
                            x.token.chainId === t.chainId &&
                            isSameAddress(x.token.address, createNativeToken(x.chainId).address),
                    ),
            )
            .map((x) => {
                const nativeToken = createNativeToken(x.chainId)
                const result = tokenUnavailableFromDebankResults.find((y) => y.chainId === x.chainId)
                return {
                    id: nativeToken.address,
                    chainId: x.chainId,
                    token: { ...nativeToken, id: nativeToken.address!, type: TokenType.Fungible },
                    balance: result?.balance ?? '0',
                    price: result?.price,
                    value: {
                        [CurrencyType.USD]: new BigNumber(result?.balance ?? '0')
                            .dividedBy(pow10(nativeToken.decimals))
                            .multipliedBy(result ? result.price[CurrencyType.USD] : '0')
                            .toFixed(),
                    },
                }
            })

        return uniqBy(
            [...nativeTokens, ...allTokens],
            (x) => `${x.token.chainId}_${formatEthereumAddress(x.token.address)}`,
        ).sort(makeSortAssertWithoutChainFn())
    }
