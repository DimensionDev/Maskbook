import { Pagination, Web3Plugin, CurrencyType } from '@masknet/plugin-infra/web3'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-solana'
import { CoinGecko } from '@masknet/web3-providers'
import { createFungibleAsset, createFungibleToken } from '../helpers'
import { TokenListProvider } from '@solana/spl-token-registry'
import { GetAccountInfoResponse, GetProgramAccountsResponse, requestRPC, SPL_TOKEN_PROGRAM_ID } from './shared'

async function getSolanaBalance(chainId: ChainId, account: string) {
    const { SOL_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGecko.getTokenPrice('solana', CurrencyType.USD)
    const data = await requestRPC<GetAccountInfoResponse>(chainId, {
        method: 'getAccountInfo',
        params: [account],
    })
    const balance = data.result?.value.lamports.toString() ?? '0'
    return createFungibleAsset(
        createFungibleToken(chainId, SOL_ADDRESS, 'Solana', 'SOL', 9),
        balance,
        new URL('../assets/solana.png', import.meta.url).toString(),
        price,
    )
}
async function getSplTokenList(chainId: ChainId, account: string) {
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
    const splTokens: Web3Plugin.Asset[] = []
    data.result.forEach((x) => {
        const info = x.account.data.parsed.info
        const token = tokenList.find((y) => y.address === info.mint)
        const isSafe = info.tokenAmount.decimals !== 0 && token !== undefined
        if (!isSafe) return
        const name = token.name || 'Unknown Token'
        const symbol = token.symbol || 'Unknown Token'
        const splToken = createFungibleAsset(
            createFungibleToken(chainId, info.mint, name, symbol, info.tokenAmount.decimals),
            info.tokenAmount.amount,
            token.logoURI,
        )
        splTokens.push(splToken)
    })
    return splTokens
}

export async function getFungibleAssets(
    address: string,
    provider: string,
    network: Web3Plugin.NetworkDescriptor,
    pagination?: Pagination,
): Promise<Array<Web3Plugin.Asset<Web3Plugin.FungibleToken>>> {
    const allSettled = await Promise.allSettled([
        getSolanaBalance(network.chainId, address).then((x) => [x]),
        getSplTokenList(network.chainId, address),
    ])

    return allSettled
        .map((x) => (x.status === 'fulfilled' ? x.value : null))
        .flat()
        .filter(Boolean) as Array<Web3Plugin.Asset<Web3Plugin.FungibleToken>>
}
