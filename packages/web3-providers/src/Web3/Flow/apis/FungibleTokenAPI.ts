import { type Pageable, createPageable, type PageIndicator, createIndicator } from '@masknet/shared-base'
import { ChainId as ChainId_EVM } from '@masknet/web3-shared-evm'
import {
    ChainId,
    createClient,
    createFungibleAsset,
    createFungibleToken,
    getTokenConstants,
    type SchemaType,
    isValidChainId,
} from '@masknet/web3-shared-flow'
import { type FungibleAsset, CurrencyType, rightShift } from '@masknet/web3-shared-base'
import * as CoinGeckoPriceEVM from /* webpackDefer: true */ '../../../CoinGecko/index.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import type { FungibleTokenAPI, TokenListAPI } from '../../../entry-types.js'

async function getTokenBalance(
    chainId: ChainId,
    account: string,
    decimals: number,
    {
        fungibleTokenAddress,
        tokenAddress,
        exportKey,
        storageKey,
    }: {
        fungibleTokenAddress: string
        tokenAddress: string
        exportKey: string
        storageKey: string
    },
) {
    const sdk = createClient(chainId)
    try {
        const balance = await sdk.query({
            cadence: `
            import FungibleToken from ${fungibleTokenAddress}
            import ${exportKey} from ${tokenAddress}

            pub fun main(address: Address): UFix64 {
                let account = getAccount(address)
                let vaultRef = account
                    .getCapability(/public/${storageKey})
                    .borrow<&${exportKey}.Vault{FungibleToken.Balance}>()
                    ?? panic("Could not borrow Balance capability")

                return vaultRef.balance
            }
        `,
            args: (arg, t) => [arg(account, t.Address)],
        })
        return rightShift(balance, decimals).integerValue().toFixed()
    } catch {
        return '0'
    }
}

async function getAssetFUSD(chainId: ChainId, account: string) {
    const { FUSD_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGeckoPriceEVM.CoinGeckoPriceEVM.getFungibleTokenPrice(ChainId_EVM.Mainnet, 'usd-coin', {
        currencyType: CurrencyType.USD,
    })
    const balance = await getTokenBalance(chainId, account, 8, {
        fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
        tokenAddress: FUSD_ADDRESS,
        exportKey: 'FUSD',
        storageKey: 'fusdBalance',
    })
    return createFungibleAsset(
        createFungibleToken(
            chainId,
            FUSD_ADDRESS,
            'Flow USD',
            'FUSD',
            8,
            new URL('../assets/FUSD.png', import.meta.url).toString(),
        ),
        balance,
        {
            [CurrencyType.USD]: price?.toString(),
        },
    )
}

async function getAssetFLOW(chainId: ChainId, account: string) {
    const { FLOW_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGeckoPriceEVM.CoinGeckoPriceEVM.getFungibleTokenPrice(ChainId_EVM.Mainnet, 'flow', {
        currencyType: CurrencyType.USD,
    })
    const balance = await getTokenBalance(chainId, account, 8, {
        fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
        tokenAddress: FLOW_ADDRESS,
        exportKey: 'FlowToken',
        storageKey: 'flowTokenBalance',
    })

    return createFungibleAsset(
        createFungibleToken(
            chainId,
            FLOW_ADDRESS,
            'Flow',
            'FLOW',
            8,
            new URL('../assets/flow.png', import.meta.url).toString(),
        ),
        balance,
        {
            [CurrencyType.USD]: price?.toString(),
        },
    )
}

async function getAssetTether(chainId: ChainId, account: string) {
    const { TETHER_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGeckoPriceEVM.CoinGeckoPriceEVM.getFungibleTokenPrice(ChainId_EVM.Mainnet, 'tether', {
        currencyType: CurrencyType.USD,
    })
    const balance = await getTokenBalance(chainId, account, 8, {
        fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
        tokenAddress: TETHER_ADDRESS,
        exportKey: 'TeleportedTetherToken',
        storageKey: 'teleportedTetherTokenBalance',
    })

    return createFungibleAsset(
        createFungibleToken(
            chainId,
            TETHER_ADDRESS,
            'Tether USD',
            'tUSD',
            8,
            new URL('../assets/tUSD.png', import.meta.url).toString(),
        ),
        balance,
        {
            [CurrencyType.USD]: price?.toString(),
        },
    )
}

class FlowFungibleAPI
    implements FungibleTokenAPI.Provider<ChainId, SchemaType>, TokenListAPI.Provider<ChainId, SchemaType>
{
    async getAssets(
        account: string,
        { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>, PageIndicator>> {
        if (!isValidChainId(chainId)) return createPageable([], createIndicator(indicator))
        const allSettled = await Promise.allSettled([
            getAssetFLOW(chainId, account),
            getAssetFUSD(chainId, account),
            getAssetTether(chainId, account),
        ])

        const items = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)).filter(Boolean) as Array<
            FungibleAsset<ChainId, SchemaType>
        >
        return createPageable(items, createIndicator(indicator))
    }

    async getFungibleTokenList(chainId: ChainId) {
        const { FLOW_ADDRESS = '', FUSD_ADDRESS = '', TETHER_ADDRESS = '' } = getTokenConstants(chainId)
        return [
            createFungibleToken(
                chainId,
                FLOW_ADDRESS,
                'Flow',
                'FLOW',
                8,
                new URL('../assets/flow.png', import.meta.url).toString(),
            ),
            createFungibleToken(
                chainId,
                FUSD_ADDRESS,
                'Flow USD',
                'FUSD',
                8,
                new URL('../assets/FUSD.png', import.meta.url).toString(),
            ),
            createFungibleToken(
                chainId,
                TETHER_ADDRESS,
                'Tether USD',
                'tUSD',
                8,
                new URL('../assets/tUSD.png', import.meta.url).toString(),
            ),
        ]
    }
}

export const FlowFungible = new FlowFungibleAPI()
