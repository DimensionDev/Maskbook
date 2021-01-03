import { useEffect, useState } from 'react'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import type { NFTInPostProps, TokenDetails } from '../types'
import { parseNftUrl } from '../utils'
import NFTCardUI from './NFTCardUI'

export default function NFTInPost(props: NFTInPostProps) {
    const [tokenDetails, setTokenDetails] = useState<TokenDetails>({
        name: null,
        description: null,
        mediaUrl: null,
    })

    useEffect(function () {
        const [address, tokenId] = parseNftUrl(props.nftUrl)
        fetch(`https://api.opensea.io/api/v1/assets/?asset_contract_address=${address}&token_ids=${tokenId}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.assets.length > 0) {
                    let asset = res.assets[0]
                    setTokenDetails({
                        name: asset.name,
                        description: asset.description,
                        mediaUrl: asset.image_original_url || null,
                    })
                }
            })
    }, [])

    return (
        <div>
            <MaskbookPluginWrapper width={400} pluginName="NFT">
                <NFTCardUI {...tokenDetails} />
            </MaskbookPluginWrapper>
        </div>
    )
}
