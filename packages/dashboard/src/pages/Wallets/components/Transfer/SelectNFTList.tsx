import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { memo } from 'react'
import { Box, ImageList } from '@mui/material'
import { NFTCard } from './NFTCard'

interface SelectNFTListProps {
    list: ERC721TokenDetailed[]
    selected: string
    onSelect(tokenId: string): void
}

export const SelectNFTList = memo<SelectNFTListProps>(({ list, onSelect, selected }) => {
    return (
        <Box>
            <ImageList
                variant="quilted"
                cols={4}
                gap={12}
                rowHeight={200}
                sx={{ width: '100%', maxWidth: 640, height: 'auto', maxHeight: '600px' }}>
                {list.map((token) => (
                    <NFTCard key={token.tokenId} token={token} selected={selected} onSelect={onSelect} />
                ))}
            </ImageList>
        </Box>
    )
})
