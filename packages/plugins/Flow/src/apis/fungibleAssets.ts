import { ChainId, createClient, getTokenConstants, SchemaType } from '@masknet/web3-shared-flow'
import { CoinGecko } from '@masknet/web3-providers'
import { FungibleAsset, CurrencyType, Pageable, rightShift, HubOptions } from '@masknet/web3-shared-base'
import { createFungibleAsset, createFungibleToken } from '../helpers'

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
    const price = await CoinGecko.getTokenPrice('usd-coin', CurrencyType.USD)
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
            [CurrencyType.USD]: price.toString(),
        },
    )
}

async function getAssetFLOW(chainId: ChainId, account: string) {
    const { FLOW_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGecko.getTokenPrice('flow', CurrencyType.USD)
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
            [CurrencyType.USD]: price.toString(),
        },
    )
}

async function getAssetTether(chainId: ChainId, account: string) {
    const { TETHER_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGecko.getTokenPrice('tether', CurrencyType.USD)
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
            [CurrencyType.USD]: price.toString(),
        },
    )
}

export async function getFungibleAssets(
    chainId: ChainId,
    address: string,
    options?: HubOptions<ChainId>,
): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
    const allSettled = await Promise.allSettled([
        getAssetFLOW(chainId, address),
        getAssetFUSD(chainId, address),
        getAssetTether(chainId, address),
    ])

    return {
        currentPage: 0,
        data: allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)).filter(Boolean) as FungibleAsset<
            ChainId,
            SchemaType
        >[],
        hasNextPage: false,
    }
}
