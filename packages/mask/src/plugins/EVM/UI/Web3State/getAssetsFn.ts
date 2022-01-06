import Web3 from 'web3'
import {
    createContract,
    createNativeToken,
    ERC721TokenDetailed,
    formatEthereumAddress,
    getERC721TokenDetailedFromChain,
    getERC721TokenAssetFromChain,
    getEthereumConstants,
    getRPCConstants,
    getTokenConstants,
    isSameAddress,
    Web3ProviderType,
    FungibleAssetProvider,
} from '@masknet/web3-shared-evm'
import { Pageable, Pagination, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { AbiItem } from 'web3-utils'
import { first, uniqBy } from 'lodash-unified'
import { PLUGIN_NETWORKS } from '../../constants'
import { makeSortAssertWithoutChainFn } from '../../utils/token'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'

export const getFungibleAssetsFn =
    (context: Web3ProviderType) =>
    async (address: string, providerType: string, network: Web3Plugin.NetworkDescriptor, pagination?: Pagination) => {
        const chainId = context.chainId.getCurrentValue()
        const provider = context.provider.getCurrentValue()
        const wallet = context.wallets.getCurrentValue().find((x) => isSameAddress(x.address, address))
        const socket = await context.providerSocket
        const networks = PLUGIN_NETWORKS
        const trustedTokens = context.erc20Tokens
            .getCurrentValue()
            .filter((x) => wallet?.erc20_token_whitelist.has(formatEthereumAddress(x.address)))

        const web3 = new Web3(provider)
        const { BALANCE_CHECKER_ADDRESS } = getEthereumConstants(chainId)
        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants()
        const socketId = `mask.fetchFungibleTokenAsset_${address}`
        let dataFromProvider = await socket.sendAsync<Web3Plugin.Asset<Web3Plugin.FungibleToken>>({
            id: socketId,
            method: 'mask.fetchFungibleTokenAsset',
            params: {
                address: address,
                pageSize: 10000,
            },
        })
        if (!dataFromProvider.length) {
            // @ts-ignore getAssetList Asset[]
            dataFromProvider = await context.getAssetsList(address, FungibleAssetProvider.DEBANK)
        }
        const assetsFromProvider: Web3Plugin.Asset<Web3Plugin.FungibleToken>[] = dataFromProvider.map((x: any) => ({
            id: x.token.address,
            chainId: x.token.chainId,
            balance: x.balance,
            price: x.price,
            value: x.value,
            logoURI: x.logoURI,
            token: {
                ...x.token,
                type: TokenType.Fungible,
                name: x.token.name ?? 'Unknown Token',
                symbol: x.token.symbol ?? 'Unknown',
                id: x.token.address,
                chainId: x.token.chainId,
            },
        }))

        if (!BALANCE_CHECKER_ADDRESS) return assetsFromProvider
        const balanceCheckerContract = createContract(web3, BALANCE_CHECKER_ADDRESS, BalanceCheckerABI as AbiItem[])
        if (!balanceCheckerContract) return assetsFromProvider
        let balanceList: string[]
        try {
            balanceList = await balanceCheckerContract?.methods
                .balances(
                    [address],
                    trustedTokens.map((x) => x.address),
                )
                .call({
                    from: undefined,
                })
            if (balanceList.length !== trustedTokens?.length) return assetsFromProvider
        } catch {
            balanceList = []
        }

        const assetFromChain = balanceList.map(
            (balance, idx): Web3Plugin.Asset<Web3Plugin.FungibleToken> => ({
                id: trustedTokens[idx].address,
                chainId: chainId,
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
            const provider = context.provider.getCurrentValue()
            const trustedTokens = context.erc721Tokens.getCurrentValue()
            const calls = trustedTokens.map(async (x) => {
                const web3 = new Web3(provider)
                const { RPC } = getRPCConstants(x.contractDetailed.chainId)
                const providerURL = first(RPC)
                if (providerURL) {
                    web3.setProvider(providerURL)
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
                }
                return null
            })

            const fromChain = await Promise.all(calls)
            tokenInDb = fromChain.filter(Boolean) as any[]
        }

        const socketId = `mask.fetchNonFungibleCollectibleAsset_${address}`
        await socket.send({
            id: socketId,
            method: 'mask.fetchNonFungibleCollectibleAsset',
            params: { address, pageSize: 40 },
        })

        const tokenFromProvider = socket.getResult<ERC721TokenDetailed>(socketId)

        const allData: Web3Plugin.NonFungibleToken[] = [...tokenInDb, ...tokenFromProvider]
            .map(
                (x) =>
                    ({
                        ...x,
                        id: `${x.contractDetailed.address}_${x.tokenId}`,
                        tokenId: x.tokenId,
                        chainId: x.contractDetailed.chainId,
                        type: TokenType.NonFungible,
                        name: x.info.name ?? `${x.contractDetailed.name} ${x.tokenId}`,
                        description: x.info.description ?? '',
                        owner: x.info.owner,
                        contract: { ...x.contractDetailed, type: TokenType.NonFungible },
                        metadata: {
                            name: x.info.name ?? `${x.contractDetailed.name} ${x.tokenId}`,
                            description: x.info.description ?? '',
                            mediaType: 'Unknown',
                            iconURL: x.contractDetailed.iconURL,
                            assetURL: x.info.mediaUrl,
                        },
                    } as Web3Plugin.NonFungibleToken),
            )
            .filter((x) => isSameAddress(x.owner, address))
            .filter((x) => !network || x.chainId === network.chainId)

        return {
            hasNextPage: tokenFromProvider.length === pagination?.size ?? 20,
            currentPage: pagination?.page ?? 0,
            data: allData,
        }
    }
