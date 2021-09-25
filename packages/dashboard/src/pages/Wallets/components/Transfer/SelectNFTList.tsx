import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { memo, useRef } from 'react'
import { Box, ImageList } from '@mui/material'
import { NFTCard } from './NFTCard'
import { useScrollBottomEvent } from '@masknet/shared'

interface SelectNFTListProps {
    onScroll(): void
    list: ERC721TokenDetailed[]
    selected: string
    onSelect(tokenId: string): void
}

export const SelectNFTList = memo<SelectNFTListProps>(({ list, onSelect, selected, onScroll }) => {
    const containerRef = useRef<HTMLUListElement>(null)
    useScrollBottomEvent(containerRef, onScroll)

    return (
        <Box>
            <ImageList
                ref={containerRef}
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
