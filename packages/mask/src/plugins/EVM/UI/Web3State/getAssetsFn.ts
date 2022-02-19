import Web3 from 'web3'
import {
    createContract,
    createNativeToken,
    formatEthereumAddress,
    getEthereumConstants,
    isSameAddress,
    Web3ProviderType,
    FungibleAssetProvider,
    createExternalProvider,
} from '@masknet/web3-shared-evm'
import { Pagination, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import type { AbiItem } from 'web3-utils'
import { uniqBy } from 'lodash-unified'
import { PLUGIN_NETWORKS } from '../../constants'
import { makeSortAssertWithoutChainFn } from '../../utils/token'
import { getProxyWebsocketInstance } from '@masknet/web3-shared-base'

export const getFungibleAssetsFn =
    (context: Web3ProviderType) =>
    async (address: string, providerType: string, network: Web3Plugin.NetworkDescriptor, pagination?: Pagination) => {
        const socket = await getProxyWebsocketInstance()
        const chainId = context.chainId.getCurrentValue()
        const wallet = context.wallets.getCurrentValue().find((x) => isSameAddress(x.address, address))
        const networks = PLUGIN_NETWORKS
        const trustedTokens = context.erc20Tokens
            .getCurrentValue()
            .filter((x) => wallet?.erc20_token_whitelist.has(formatEthereumAddress(x.address)))

        const web3 = new Web3(
            createExternalProvider(context.request, context.getSendOverrides, context.getRequestOptions),
        )
        const { BALANCE_CHECKER_ADDRESS } = getEthereumConstants(chainId)
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
                    address: trustedTokens[idx].address,
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
                        (x) =>
                            x.token.chainId === t.chainId &&
                            isSameAddress(x.token.address, createNativeToken(x.chainId).address),
                    ),
            )
            .map((x) => {
                const nativeToken = createNativeToken(x.chainId)
                return {
                    id: nativeToken.address,
                    chainId: x.chainId,
                    token: { ...nativeToken, id: nativeToken.address!, type: TokenType.Fungible },
                    balance: '0',
                }
            })

        return uniqBy(
            [...nativeTokens, ...allTokens],
            (x) => `${x.token.chainId}_${formatEthereumAddress(x.token.address)}`,
        ).sort(makeSortAssertWithoutChainFn())
    }
