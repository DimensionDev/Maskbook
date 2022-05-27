import { memo, useMemo } from 'react'
import { Box, ImageList, Typography, ImageListItem, Stack } from '@mui/material'
import { NFTCard } from './NFTCard'
import { LoadingAnimation } from '@masknet/shared'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

interface SelectNFTListProps {
    list: NonFungibleToken<ChainId, SchemaType>[]
    selectedTokenId: string
    loading: boolean
    error?: boolean
    onSelect(tokenId: string): void
}

export const SelectNFTList = memo<SelectNFTListProps>(({ list, onSelect, selectedTokenId, loading, error }) => {
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
                ...(error
                    ? {
                          boxShadow: `0 0 0 4px ${MaskColorVar.redMain.alpha(0.2)}`,
                          border: `1px solid ${MaskColorVar.redMain.alpha(0.8)}`,
                      }
                    : {}),
                background: (theme) =>
                    theme.palette.mode === 'dark' ? MaskColorVar.lightBackground : MaskColorVar.normalBackground,
            }}>
            <ImageList
                variant="quilted"
                cols={4}
                gap={12}
                rowHeight={186}
                sx={{ width: '100%', height: 'auto', maxHeight: '400px', p: 2, pb: 0.5 }}>
                {list.map((token, index) => (
                    <NFTCard
                        key={token.tokenId}
                        token={token}
                        selectedTokenId={selectedTokenId}
                        onSelect={onSelect}
                        renderOrder={index}
                    />
                ))}
                {renderStatus}
            </ImageList>
        </Box>
    )
})
