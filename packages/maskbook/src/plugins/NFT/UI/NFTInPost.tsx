import { useEffect, useState } from 'react'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import type { NFTInPostProps, TokenDetails } from '../types'
import { parseNftUrl } from '../utils'
import NFTCardUI from './NFTCardUI'

export default function NFTInPost(props: NFTInPostProps) {
    const [tokenDetails, setTokenDetails] = useState<TokenDetails>({})

    useEffect(function () {
        const [address, tokenId] = parseNftUrl(props.nftUrl)

        if (address && tokenId) {
            const link = new window.URL('https://api.opensea.io/api/v1/assets')
            link.searchParams.set('asset_contract_address', address)
            link.searchParams.set('token_ids', tokenId)

            fetch(link.toString())
                .then((res) => res.json())
                .then((res) => {
                    if (res.assets.length > 0) {
                        let asset = res.assets[0]

                        let updatedTokenDetails: TokenDetails = {}
                        if (asset.name) updatedTokenDetails.name = asset.name
                        if (asset.description) updatedTokenDetails.description = asset.description
                        if (asset.image_url) updatedTokenDetails.imageUrl = new window.URL(asset.image_url)
                        if (asset.animation_url) updatedTokenDetails.animationUrl = new window.URL(asset.animation_url)

                        setTokenDetails(updatedTokenDetails)
                    }
                })
        }
    }, [])

    return tokenDetails.animationUrl || tokenDetails.imageUrl ? (
        <div>
            <MaskbookPluginWrapper width={400} pluginName="NFT">
                <NFTCardUI {...tokenDetails} />
            </MaskbookPluginWrapper>
        </div>
    ) : null
}
