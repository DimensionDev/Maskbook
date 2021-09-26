import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { memo, useMemo, useRef } from 'react'
import { Box, ImageList, Typography } from '@mui/material'
import { NFTCard } from './NFTCard'
import { LoadingAnimation, useScrollBottomEvent } from '@masknet/shared'
import { ImageListItem, Stack } from '@material-ui/core'

interface SelectNFTListProps {
    onScroll(): void
    list: ERC721TokenDetailed[]
    selected: string
    loading: boolean
    loadMore: boolean
    onSelect(tokenId: string): void
}

export const SelectNFTList = memo<SelectNFTListProps>(({ list, onSelect, selected, onScroll, loading, loadMore }) => {
    const containerRef = useRef<HTMLUListElement>(null)
    useScrollBottomEvent(containerRef, onScroll)

    const renderStatus = useMemo(() => {
        if (loading) return <LoadingAnimation />
        if (!loadMore)
            return (
                <Typography component="span" variant="body2">
                    Load end
                </Typography>
            )
        return null
    }, [])

    return (
        <Box>
            <ImageList
                ref={containerRef}
                variant="quilted"
                cols={4}
                gap={12}
                rowHeight={200}
                sx={{ width: '100%', maxWidth: 640, height: 'auto', maxHeight: '400px' }}>
                {list.map((token) => (
                    <NFTCard key={token.tokenId} token={token} selected={selected} onSelect={onSelect} />
                ))}
                <ImageListItem sx={{ height: '30px !important' }} cols={4}>
                    <Stack direction="row" justifyContent="center">
                        {renderStatus}
                    </Stack>
                </ImageListItem>
            </ImageList>
        </Box>
    )
})
