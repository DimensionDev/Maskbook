import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { memo, useMemo, useRef } from 'react'
import { Box, ImageList, Typography } from '@mui/material'
import { NFTCard } from './NFTCard'
import { LoadingAnimation, useScrollBottomEvent } from '@masknet/shared'
import { ImageListItem, Stack } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'

interface SelectNFTListProps {
    onScroll(): void
    list: ERC721TokenDetailed[]
    selectedTokenId: string
    loading: boolean
    loadMore: boolean
    onSelect(tokenId: string): void
}

export const SelectNFTList = memo<SelectNFTListProps>(
    ({ list, onSelect, selectedTokenId, onScroll, loading, loadMore }) => {
        const t = useDashboardI18N()
        const containerRef = useRef<HTMLUListElement>(null)
        useScrollBottomEvent(containerRef, onScroll)

        const renderStatus = useMemo(() => {
            if (loading) return <LoadingAnimation />
            if (!loadMore)
                return (
                    <Typography component="span" variant="body2">
                        {t.wallets_collectible_load_end()}
                    </Typography>
                )
            return null
        }, [loading, loadMore])

        return (
            <Box
                sx={{
                    width: 640,
                    borderRadius: '12px',
                    background: (theme) =>
                        theme.palette.mode === 'dark' ? MaskColorVar.lightBackground : MaskColorVar.normalBackground,
                }}>
                <ImageList
                    ref={containerRef}
                    variant="quilted"
                    cols={4}
                    gap={12}
                    rowHeight={186}
                    sx={{ width: '100%', height: 'auto', maxHeight: '400px', p: 2 }}>
                    {list.map((token) => (
                        <NFTCard
                            key={token.tokenId}
                            token={token}
                            selectedTokenId={selectedTokenId}
                            onSelect={onSelect}
                        />
                    ))}
                    <ImageListItem sx={{ height: '30px !important' }} cols={4}>
                        <Stack direction="row" justifyContent="center">
                            {renderStatus}
                        </Stack>
                    </ImageListItem>
                </ImageList>
            </Box>
        )
    },
)
