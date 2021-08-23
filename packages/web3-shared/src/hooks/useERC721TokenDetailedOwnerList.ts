import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useOpenseaAPIConstants } from '../constants'
import type { ERC721ContractDetailed, ERC721TokenDetailed } from '../types'

export function useERC721TokenDetailedOwnerList(contractDetailed: ERC721ContractDetailed | undefined, owner: string) {
    const { GET_ASSETS_URL } = useOpenseaAPIConstants()
    return useAsyncRetry(async () => {
        if (
            !contractDetailed?.address ||
            !EthereumAddress.isValid(contractDetailed?.address) ||
            !owner ||
            !GET_ASSETS_URL
        )
            return
        return getERC721TokenDetailedOwnerListFromOpensea(contractDetailed, owner, GET_ASSETS_URL)
    }, [GET_ASSETS_URL, contractDetailed, owner])
}

async function getERC721TokenDetailedOwnerListFromOpensea(
    contractDetailed: ERC721ContractDetailed,
    owner: string,
    apiURL: string,
) {
    const response = await fetch(`${apiURL}?owner=${owner}&asset_contract_address=${contractDetailed.address}`)
    type DataType = {
        image_url: string
        name: string
        token_id: string
    }
    if (response.ok) {
        const { assets }: { assets: DataType[] } = await response.json()

        return assets.map(
            (asset) =>
                ({
                    tokenId: asset.token_id,
                    contractDetailed,
                    info: {
                        name: asset.name,
                        image: asset.image_url,
                        owner,
                    },
                } as ERC721TokenDetailed),
        )
    }
    return []
}
