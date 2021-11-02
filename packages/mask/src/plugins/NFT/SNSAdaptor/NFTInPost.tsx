import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import type { NFTInPostProps, TokenDetails } from '../types'
import { parseNftUrl } from '../utils'
import NFTCardUI from './NFTCardUI'
import { openseaAssetsApiUrl } from '../constants'

export default function NFTInPost(props: NFTInPostProps) {
    const tokenDetailsResponse = useAsync(
        async function () {
            const updatedTokenDetails: TokenDetails = {}
            const [address, tokenId] = parseNftUrl(props.nftUrl)

            // if nftUrl is invalid
            if (!(address && tokenId)) return updatedTokenDetails

            const link = new URL(openseaAssetsApiUrl)
            link.searchParams.set('asset_contract_address', address)
            link.searchParams.set('token_ids', tokenId)

            try {
                const response = await Services.Helper.fetch(link.toString())
                const { assets } = JSON.parse(await response.text())

                // if `assets` is an empty array, finally block will return the empty `updatedTokenDetails`
                if (assets[0].name) updatedTokenDetails.name = assets[0].name
                if (assets[0].description) updatedTokenDetails.description = assets[0].description
                if (assets[0].image_url) updatedTokenDetails.imageUrl = new URL(assets[0].image_url)
            } finally {
                return updatedTokenDetails
            }
        },
        [props.nftUrl],
    )

    return !tokenDetailsResponse.loading && !tokenDetailsResponse.error && tokenDetailsResponse.value?.imageUrl ? (
        <MaskPluginWrapper width={400} pluginName="NFT">
            <NFTCardUI {...tokenDetailsResponse.value} />
        </MaskPluginWrapper>
    ) : null
}
