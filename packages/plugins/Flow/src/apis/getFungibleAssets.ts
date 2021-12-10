import { Pagination, Web3Plugin, CurrencyType } from '@masknet/plugin-infra'
import { ChainId, createClient, getTokenConstants } from '@masknet/web3-shared-flow'
import { getTokenPrice } from '@masknet/web3-providers'
import { createFungibleAsset, createFungibleToken } from '../helpers'
import { leftShift } from '@masknet/web3-shared-base'

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
        return leftShift(balance, decimals).integerValue().toFixed()
    } catch {
        return '0'
    }
}

async function getAssetFUSD(chainId: ChainId, account: string) {
    const { FUSD_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await getTokenPrice('usd-coin', CurrencyType.USD)
    const balance = await getTokenBalance(chainId, account, 8, {
        fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
        tokenAddress: FUSD_ADDRESS,
        exportKey: 'FUSD',
        storageKey: 'fusdBalance',
    })
    return createFungibleAsset(
        createFungibleToken(chainId, FUSD_ADDRESS, 'Flow USD', 'FUSD', 8),
        balance,
        new URL('../assets/FUSD.png', import.meta.url).toString(),
        price,
    )
}

async function getAssetFLOW(chainId: ChainId, account: string) {
    const { FLOW_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await getTokenPrice('flow', CurrencyType.USD)
    const balance = await getTokenBalance(chainId, account, 8, {
        fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
        tokenAddress: FLOW_ADDRESS,
        exportKey: 'FlowToken',
        storageKey: 'flowTokenBalance',
    })

    return createFungibleAsset(
        createFungibleToken(chainId, FLOW_ADDRESS, 'Flow', 'FLOW', 8),
        balance,
        new URL('../assets/flow.png', import.meta.url).toString(),
        price,
    )
}

async function getAssetTether(chainId: ChainId, account: string) {
    const { TETHER_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await getTokenPrice('tether', CurrencyType.USD)
    const balance = await getTokenBalance(chainId, account, 8, {
        fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
        tokenAddress: TETHER_ADDRESS,
        exportKey: 'TeleportedTetherToken',
        storageKey: 'teleportedTetherTokenBalance',
    })

    return createFungibleAsset(
        createFungibleToken(chainId, TETHER_ADDRESS, 'Tether USD', 'tUSD', 8),
        balance,
        new URL('../assets/tUSD.png', import.meta.url).toString(),
        price,
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
