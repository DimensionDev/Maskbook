import {
    getRegisteredWeb3Networks,
    NetworkPluginID,
    Pageable,
    Pagination,
    TokenType,
    Web3Plugin,
} from '@masknet/plugin-infra/web3'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { TokenPrice } from '@masknet/web3-providers'
import { pow10 } from '@masknet/web3-shared-base'
import {
    ChainId,
    createContract,
    createExternalProvider,
    createNativeToken,
    CurrencyType,
    ERC721TokenDetailed,
    formatEthereumAddress,
    FungibleAssetProvider,
    getCoinGeckoCoinId,
    getERC721TokenAssetFromChain,
    getERC721TokenDetailedFromChain,
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
import { createGetLatestBalance } from './createGetLatestBalance'
import { createNonFungibleToken } from './createNonFungibleToken'

// tokens unavailable neither from api or balance checker.
// https://forum.conflux.fun/t/how-to-upvote-debank-proposal-for-conflux-espace-integration/13935
const TokenUnavailableFromDebankList = [ChainId.Conflux]

export const getFungibleAssetsFn =
    (context: Web3ProviderType) =>
    async (address: string, providerType: string, network: Web3Plugin.NetworkDescriptor, pagination?: Pagination) => {
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
                    id: trustedTokens[idx].address,
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
                price,
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
                            isSameAddress(x.token.id, createNativeToken(x.chainId).address),
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
            (x) => `${x.token.chainId}_${formatEthereumAddress(x.token.id)}`,
        ).sort(makeSortAssertWithoutChainFn())
    }

export const getNonFungibleTokenFn =
    (context: Web3ProviderType) =>
    async (
        address: string,
        pagination: Pagination,
        providerType?: string,
        network?: Web3Plugin.NetworkDescriptor,
    ): Promise<Pageable<Web3Plugin.NonFungibleToken>> => {
        const socket = await context.providerSocket
        let tokenInDb: ERC721TokenDetailed[] = []
        // validate and show trusted erc721 token in first page
        if (pagination?.page === 0) {
            const trustedTokens = context.erc721Tokens.getCurrentValue()
            const calls = trustedTokens.map(async (x) => {
                const web3 = new Web3(
                    createExternalProvider(
                        context.request,
                        () => ({
                            ...context.getSendOverrides?.(),
                            chainId: x.contractDetailed.chainId,
                        }),
                        context.getRequestOptions,
                    ),
                )
                const contract = createContract<ERC721>(web3, x.contractDetailed.address, ERC721ABI as AbiItem[])
                if (!contract) return null
                const tokenDetailed = await getERC721TokenDetailedFromChain(x.contractDetailed, contract, x.tokenId)
                const info = await getERC721TokenAssetFromChain(tokenDetailed?.info.tokenURI)
                if (tokenDetailed && info)
                    tokenDetailed.info = {
                        ...info,
                        ...tokenDetailed.info,
                        hasTokenDetailed: true,
                        name: info.name ?? tokenDetailed.info.name,
                    }
                return tokenDetailed
            })

            const fromChain = await Promise.all(calls)
            tokenInDb = fromChain.filter(Boolean) as any[]
        }

        const socketId = `mask.fetchNonFungibleCollectibleAsset_${address}`
        socket.send({
            id: socketId,
            method: 'mask.fetchNonFungibleCollectibleAsset',
            params: { address, pageSize: 40 },
        })

        const tokenFromProvider = socket.getResult<ERC721TokenDetailed>(socketId)
        const allData: Web3Plugin.NonFungibleToken[] = [...tokenInDb, ...tokenFromProvider]
            .map(createNonFungibleToken)
            .filter((x) => isSameAddress(x.owner, address))
            .filter((x) => !network || x.chainId === network.chainId)

        return {
            hasNextPage: tokenFromProvider.length === pagination?.size ?? 20,
            currentPage: pagination?.page ?? 0,
            data: allData,
        }
    }
