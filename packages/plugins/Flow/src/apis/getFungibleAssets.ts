import BigNumber from 'bignumber.js'
import { Pagination, Web3Plugin, CurrencyType } from '@masknet/plugin-infra'
import { ChainId, createClient, getTokenConstants } from '@masknet/web3-shared-flow'
import { getTokenPrice } from '@masknet/web3-providers'
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
        return new BigNumber(balance)
            .multipliedBy(10 ** decimals)
            .integerValue()
            .toFixed()
    } catch {
        return '0'
    }
}

async function getAssetFUSD(chainId: ChainId, account: string) {
    const { FUSD_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const value = await getTokenPrice('usd-coin', CurrencyType.USD)

    return createFungibleAsset(
        createFungibleToken(chainId, FUSD_ADDRESS, 'Flow USD', 'FUSD', 8),
        await getTokenBalance(chainId, account, 8, {
            fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
            tokenAddress: FUSD_ADDRESS,
            exportKey: 'FUSD',
            storageKey: 'fusdBalance',
        }),
        value,
        new URL('../assets/FUSD.png', import.meta.url).toString(),
    )
}

async function getAssetFLOW(chainId: ChainId, account: string) {
    const { FLOW_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const value = await getTokenPrice('flow', CurrencyType.USD)

    return createFungibleAsset(
        createFungibleToken(chainId, FLOW_ADDRESS, 'Flow', 'FLOW', 8),
        await getTokenBalance(chainId, account, 8, {
            fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
            tokenAddress: FLOW_ADDRESS,
            exportKey: 'FlowToken',
            storageKey: 'flowTokenBalance',
        }),
        value,
        new URL('../assets/flow.png', import.meta.url).toString(),
    )
}

async function getAssetTether(chainId: ChainId, account: string) {
    const { TETHER_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const value = await getTokenPrice('tether', CurrencyType.USD)

    return createFungibleAsset(
        createFungibleToken(chainId, TETHER_ADDRESS, 'Tether USD', 'tUSD', 8),
        await getTokenBalance(chainId, account, 8, {
            fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
            tokenAddress: TETHER_ADDRESS,
            exportKey: 'TeleportedTetherToken',
            storageKey: 'teleportedTetherTokenBalance',
        }),
        value,
        new URL('../assets/tUSD.png', import.meta.url).toString(),
    )
}

export async function getFungibleAssets(
    address: string,
    provider: string,
    network: Web3Plugin.NetworkDescriptor,
    pagination?: Pagination,
): Promise<Web3Plugin.Asset<Web3Plugin.FungibleToken>[]> {
    const allSettled = await Promise.allSettled([
        getAssetFLOW(network.chainId, address),
        getAssetFUSD(network.chainId, address),
        getAssetTether(network.chainId, address),
    ])

    return allSettled
        .map((x) => (x.status === 'fulfilled' ? x.value : null))
        .filter(Boolean) as Web3Plugin.Asset<Web3Plugin.FungibleToken>[]
}
