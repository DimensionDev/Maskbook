import { FungibleAsset, CurrencyType, Pageable, HubOptions, createPageable } from '@masknet/web3-shared-base'
import { ChainId, getTokenConstants, SchemaType } from '@masknet/web3-shared-solana'
import { CoinGecko } from '@masknet/web3-providers'
import { TokenListProvider } from '@solana/spl-token-registry'
import { createFungibleAsset, createFungibleToken } from '../helpers'
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
        createFungibleToken(
            chainId,
            SOL_ADDRESS,
            'Solana',
            'SOL',
            9,
            new URL('../assets/solana.png', import.meta.url).toString(),
        ),
        balance,
        {
            [CurrencyType.USD]: price.toString(),
        },
    )
}

export async function getAllSplTokens(chainId: ChainId) {
    const tokenListProvider = new TokenListProvider()
    const provider = await tokenListProvider.resolve()
    const tokenList = provider.filterByChainId(chainId).getList()
    return tokenList
}

export async function getSplTokenList(chainId: ChainId, account: string) {
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
    const tokenList = await getAllSplTokens(chainId)
    const splTokens: Array<FungibleAsset<ChainId, SchemaType>> = []
    data.result.forEach((x) => {
        const info = x.account.data.parsed.info
        const token = tokenList.find((y) => y.address === info.mint)
        const isSafe = info.tokenAmount.decimals !== 0 && token !== undefined
        if (!isSafe) return
        const name = token.name || 'Unknown Token'
        const symbol = token.symbol || 'Unknown Token'
        const splToken = createFungibleAsset(
            createFungibleToken(chainId, info.mint, name, symbol, info.tokenAmount.decimals, token.logoURI),
            info.tokenAmount.amount,
        )
        splTokens.push(splToken)
    })
    return splTokens
}

export async function getFungibleAssets(
    address: string,
    options?: HubOptions<ChainId>,
): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
    const allSettled = await Promise.allSettled([
        getSolanaBalance(options?.chainId || ChainId.Mainnet, address).then((x) => [x]),
        getSplTokenList(options?.chainId || ChainId.Mainnet, address),
    ])
    const assets = allSettled
        .map((x) => (x.status === 'fulfilled' ? x.value : null))
        .flat()
        .filter(Boolean)

    return createPageable(assets as Array<FungibleAsset<ChainId, SchemaType>>, 0)
}
