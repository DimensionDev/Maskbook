import { ERC721ContractDetailed, EthereumTokenType, ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'

const NFTSCAN_ID = 't9k2o5GC'
const NFTSCAN_SECRET = '21da1d638ef5d0bf76e37aa5c2da7fd789ade9e3'
const NFTSCAN_URL = 'https://restapi.nftscan.com'
const NFTSCAN_BASE_API = `${NFTSCAN_URL}/api/v1`

let token = ''
let token_expiration = 0

async function getToken() {
    const requestPath = urlcat(NFTSCAN_URL, '/gw/token', { apiKey: NFTSCAN_ID, apiSecret: NFTSCAN_SECRET })
    const response = await fetch(requestPath, { mode: 'cors' })
    interface Payload {
        data: {
            accessToken: string
            expiration: number
        }
    }
    const { data }: Payload = await response.json()
    token = data.accessToken
    token_expiration = Date.now() + data.expiration * 1000
}

export async function findAssets(address: string) {
    if (token === '' || Date.now() > token_expiration) {
        await getToken()
    }

    const response = await fetch(urlcat(NFTSCAN_BASE_API, '/getGroupByNftContract'), {
        headers: {
            'Content-Type': 'application/json',
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

    if (!data) {
        return null
    }

    return data
        .map((value) => {
            const contractDetailed: ERC721ContractDetailed = {
                name: value.nft_platform_name,
                symbol: '',
                address: formatEthereumAddress(value.nft_contract_address),
                type: EthereumTokenType.ERC721,
                chainId: ChainId.Mainnet,
            }
            const balance = value.nft_asset_count
            return { contractDetailed, balance }
        })
        .sort((a, b) => b.balance - a.balance)
}
