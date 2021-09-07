import { ChainId, CollectibleProvider, ERC721TokenDetailed, resolveCollectibleLink } from '@masknet/web3-shared'
import { memo, useState } from 'react'
import { ImageListItem, ImageListItemBar, Link } from '@material-ui/core'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'

export interface CollectibleCardProps {
    chainId: ChainId
    provider: CollectibleProvider
    token: ERC721TokenDetailed
}

export const CollectibleCard = memo<CollectibleCardProps>(({ chainId, provider, token }) => {
    const [loadFailed, setLoadFailed] = useState(false)

    if (loadFailed) {
        return <CollectiblePlaceholder />
    }

    return token.info.image ? (
        <ImageListItem sx={{ height: 186, width: 144, mb: 4 }}>
            <Link
                target="_blank"
                rel="noopener noreferrer"
                href={resolveCollectibleLink(chainId, provider, token)}
                sx={{ display: 'inline-flex', width: '100%', height: '100%' }}>
                <img
                    onError={() => setLoadFailed(true)}
                    src={token.info.image}
                    style={{ width: '100%', height: '100%', borderRadius: '8px 8px 0px 0px', objectFit: 'cover' }}
                />
            </Link>
            <ImageListItemBar sx={{ py: 1 }} subtitle={<span>{token.info.name}</span>} position="below" />
        </ImageListItem>
    ) : (
        <CollectiblePlaceholder />
    )
})
