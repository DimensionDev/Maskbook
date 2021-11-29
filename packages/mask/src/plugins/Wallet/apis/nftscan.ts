import { ERC721ContractDetailed, EthereumTokenType, ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'

const NFTSCAN_ID = 't9k2o5GC'
const NFTSCAN_SECRET = '21da1d638ef5d0bf76e37aa5c2da7fd789ade9e3'
const NFTSCAN_URL = 'https://restapi.nftscan.com'
const NFTSCAN_BASE_API = `${NFTSCAN_URL}/api/v1`

let token: string = ''
let token_expiration: number = 0

async function getToken() {
    const params = new URLSearchParams()
    params.append('apiKey', NFTSCAN_ID)
    params.append('apiSecret', NFTSCAN_SECRET)
    const response = await fetch(`${NFTSCAN_URL}/gw/token?${params.toString()}`, {
        mode: 'cors',
    })

    const { data }: { data: { accessToken: string; expiration: number } } = await response.json()
    token = data.accessToken
    token_expiration = Date.now() + data.expiration * 1000
}

export async function findAssets(address: string) {
    if (token === '' || Date.now() > token_expiration) {
        await getToken()
    }

    const response = await fetch(`${NFTSCAN_BASE_API}/getGroupByNftContract`, {
        headers: {
            'content-type': 'application/json',
            'Access-Token': token,
        },
        method: 'POST',
        body: JSON.stringify({
            erc: 'erc721',
            user_address: address,
        }),
    })

    if (!response.ok) return null

    type NFT_Assets = {
        nft_asset: any[]
        nft_asset_count: number
        nft_contract_address: string
        nft_platform_count: number
        nft_platform_describe: string
        nft_platform_image: string
        nft_platform_name: string
    }

    const { data }: { data: NFT_Assets[] | null } = await response.json()

    return data
        ? data
              .map((value) => {
                  const contractDetailed: ERC721ContractDetailed = {
                      name: value.nft_platform_name,
                      symbol: '',
                      address: formatEthereumAddress(value.nft_contract_address),
                      type: EthereumTokenType.ERC721,
                      chainId: ChainId.Mainnet,
                  }

                  const balance = value.nft_asset_count

                  return {
                      contractDetailed,
                      balance,
                  }
              })
              .sort((a, b) => b.balance - a.balance)
        : null
}
