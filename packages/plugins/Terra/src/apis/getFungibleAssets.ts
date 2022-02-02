import { Pagination, Web3Plugin, CurrencyType } from '@masknet/plugin-infra'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-terra'
import { CoinGecko } from '@masknet/web3-providers'
import { createFungibleAsset, createFungibleToken } from '../helpers'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { GetAccountInfoResponse, GetProgramAccountsResponse, requestRPC, SPL_TOKEN_PROGRAM_ID } from './shared'

async function getTerraBalance(chainId: ChainId, account: string) {
    const { LUNA_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGecko.getTokenPrice('solana', CurrencyType.USD)
    const data = await requestRPC<GetAccountInfoResponse>(chainId, {
        method: 'getAccountInfo',
        params: [account],
    })
    const balance = data.result?.value.lamports.toString() ?? '0'
    return createFungibleAsset(
        createFungibleToken(chainId, LUNA_ADDRESS, 'Luna', 'LUNA', 9),
        balance,
        new URL('../assets/luna.png', import.meta.url).toString(),
        price,
    )
}
async function getTerraTokenList(chainId: ChainId, account: string) {
    const data = await requestRPC<GetProgramAccountsResponse>(chainId, {
        method: 'getProgramAccounts',
        params: [
            SPL_TOKEN_PROGRAM_ID,
            {
                encoding: 'jsonParsed',
                filters: [
                    {
                        dataSize: 165,
                    },
                    {
                        memcmp: {
                            offset: 32,
                            bytes: account,
                        },
                    },
                ],
            },
        ],
    })
    if (!data.result?.length) return []
    const tokenListProvider = new TokenListProvider()
    const provider = await tokenListProvider.resolve()
    const tokenList = provider.filterByChainId(chainId).getList()
    return data.result
        .filter((x) => x.account.data.parsed.info.tokenAmount.decimals !== 0) // Filter out non fun.
        .map((x) => {
            const info = x.account.data.parsed.info
            const token = tokenList.find((y) => y.address === info.mint) ?? ({} as TokenInfo)
            const name = token.name || 'Unknown Token'
            const symbol = token.symbol || 'Unknown Token'
            return createFungibleAsset(
                createFungibleToken(chainId, info.mint, name, symbol, info.tokenAmount.decimals),
                info.tokenAmount.amount,
                token.logoURI,
            )
        })
}

export async function getFungibleAssets(
    address: string,
    provider: string,
    network: Web3Plugin.NetworkDescriptor,
    pagination?: Pagination,
): Promise<Web3Plugin.Asset<Web3Plugin.FungibleToken>[]> {
    const allSettled = await Promise.allSettled([
        getTerraBalance(network.chainId, address).then((x) => [x]),
        getTerraTokenList(network.chainId, address),
    ])

    return allSettled
        .map((x) => (x.status === 'fulfilled' ? x.value : null))
        .flat()
        .filter(Boolean) as Web3Plugin.Asset<Web3Plugin.FungibleToken>[]
}
