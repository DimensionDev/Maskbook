import { ERC721ContractDetailed, EthereumTokenType, ChainId } from '@masknet/web3-shared-evm'
const NFTSCAN_TOKEN_ID = 'bcaa7c6850d2489e8cb0247e0abdce50'
const CORS_PROXY = 'https://whispering-harbor-49523.herokuapp.com'
const BASE_API = 'https://api.nftscan.com/api/v1'

export async function findAssets(address: string) {
    const response = await fetch(`${CORS_PROXY}/${BASE_API}/${address}/findAssets`, {
        headers: {
            'content-type': 'application/json',
            Authorization: NFTSCAN_TOKEN_ID,
        },
    })

    if (!response.ok) return null

    type NFT_Assets = {
        nft_platform_list: {
            nft_platform_contract: string
            nft_platform_name: string
            nft_list: {
                nft_creator: string
            }[]
        }[]
    }

    const { data }: { data: NFT_Assets | null } = await response.json()

    return data?.nft_platform_list
        ? data.nft_platform_list
              .map((value) => {
                  const contractDetailed: ERC721ContractDetailed = {
                      name: value.nft_platform_name,
                      symbol: '',
                      address: value.nft_platform_contract,
                      type: EthereumTokenType.ERC721,
                      chainId: ChainId.Mainnet,
                  }

                  const balance = value.nft_list.length

                  return {
                      contractDetailed,
                      balance,
                  }
              })
              .sort((a, b) => b.balance - a.balance)
        : null
}
