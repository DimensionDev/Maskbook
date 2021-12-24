import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { memo, useMemo } from 'react'
import { Box, ImageList, Typography } from '@mui/material'
import { NFTCard } from './NFTCard'
import { LoadingAnimation } from '@masknet/shared'
import { ImageListItem, Stack } from '@mui/material'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'

interface SelectNFTListProps {
    list: ERC721TokenDetailed[]
    selectedTokenId: string
    loading: boolean
    onSelect(tokenId: string): void
}

export const SelectNFTList = memo<SelectNFTListProps>(({ list, onSelect, selectedTokenId, loading }) => {
    const t = useDashboardI18N()

    const renderStatus = useMemo(() => {
        if (loading) {
            return (
                <ImageListItem sx={{ height: '30px !important' }} cols={4}>
                    <Stack direction="row" justifyContent="center">
                        <LoadingAnimation />
                    </Stack>
                </ImageListItem>
            )
        }

        return (
            <ImageListItem sx={{ height: '30px !important' }} cols={4}>
                <Stack direction="row" justifyContent="center">
                    <Typography component="span" variant="body2">
                        {t.wallets_collectible_load_end()}
                    </Typography>
                </Stack>
            </ImageListItem>
        )
    }, [loading])

    return (
        <Box
            sx={{
                width: 640,
                borderRadius: '12px',
                background: (theme) =>
                    theme.palette.mode === 'dark' ? MaskColorVar.lightBackground : MaskColorVar.normalBackground,
            }}>
            <ImageList
                variant="quilted"
                cols={4}
                gap={12}
                rowHeight={186}
                sx={{ width: '100%', height: 'auto', maxHeight: '400px', p: 2, pb: 0.5 }}>
                {list.map((token) => (
                    <NFTCard key={token.tokenId} token={token} selectedTokenId={selectedTokenId} onSelect={onSelect} />
                ))}
                {renderStatus}
            </ImageList>
        </Box>
    )
})
