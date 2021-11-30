import Web3 from 'web3'
import {
    ChainId,
    CollectibleProvider,
    createContract,
    createNativeToken,
    ERC721TokenDetailed,
    formatEthereumAddress,
    getERC721TokenDetailedFromChain,
    getEthereumConstants,
    getTokenConstants,
    isSameAddress,
    PortfolioProvider,
    Web3ProviderType,
} from '@masknet/web3-shared-evm'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { Pageable, Pagination, TokenType } from '@masknet/plugin-infra'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { AbiItem } from 'web3-utils'
import { uniqBy } from 'lodash-unified'
import { PLUGIN_NETWORKS } from '../../constants'
import { makeSortAssertWithoutChainFn } from '../../utils/token'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'

export const getFungibleAssetsFn =
    (context: Web3ProviderType) =>
    async (address: string, providerType: string, network: Web3Plugin.NetworkDescriptor, pagination?: Pagination) => {
        const chainId = context.chainId.getCurrentValue()
        const provider = context.provider.getCurrentValue()
        const wallet = context.wallets.getCurrentValue().find((x) => isSameAddress(x.address, address))
        const networks = PLUGIN_NETWORKS
        const trustedTokens = context.erc20Tokens
            .getCurrentValue()
            .filter((x) => wallet?.erc20_token_whitelist.has(formatEthereumAddress(x.address)))

        const web3 = new Web3(provider)
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
                name: x.token.name ?? 'Unknown Token'!,
                symbol: x.token.symbol ?? 'Unknown',
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
        let tokenInDb: ERC721TokenDetailed[] = []

        // validate and show trusted erc721 token in first page
        if (pagination?.page === 0) {
            const provider = context.provider.getCurrentValue()
            const web3 = new Web3(provider)
            const trustedTokens = context.erc721Tokens.getCurrentValue()
            const calls = trustedTokens.map((x) => {
                const contract = createContract<ERC721>(web3, x.contractDetailed.address, ERC721ABI as AbiItem[])
                if (!contract) return null
                return getERC721TokenDetailedFromChain(x.contractDetailed, contract, x.tokenId)
            })

            const fromChain = await Promise.all(calls)
            tokenInDb = fromChain.filter(Boolean) as any[]
        }

        const tokenFromProvider = await context.getAssetsListNFT(
            address.toLowerCase(),
            network?.chainId ?? ChainId.Mainnet,
            CollectibleProvider.OPENSEA,
            pagination?.page ?? 0,
            pagination?.size ?? 20,
        )

        const allData: Web3Plugin.NonFungibleToken[] = [...tokenInDb, ...tokenFromProvider.assets]
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
                            assetURL: x.info.image,
                        },
                    } as Web3Plugin.NonFungibleToken),
            )
            .filter((x) => isSameAddress(x.owner, address))
            .filter((x) => !network || x.chainId === network.chainId)

        return {
            hasNextPage: tokenFromProvider.assets.length === pagination?.size ?? 20,
            currentPage: pagination?.page ?? 0,
            data: allData,
        }
    }
